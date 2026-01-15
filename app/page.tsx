'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const [pages, setPages] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  const [upgradeStatus, setUpgradeStatus] = useState<string | null>(null)
  const [didMarkPro, setDidMarkPro] = useState(false)

  // 1️⃣ Load session ONCE
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)

      if (data.session) {
        fetchPages(data.session.user.id)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
        if (session) fetchPages(session.user.id)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // 2️⃣ Mark user Pro after Stripe success
  useEffect(() => {
    if (success === 'true' && session?.user && !didMarkPro) {
      markUserPro()
    }
  }, [success, session])

  const markUserPro = async () => {
    setDidMarkPro(true)
    setUpgradeStatus('Updating profile to Pro...')

    const { error } = await supabase
      .from('profiles')
      .update({ is_pro: true })
      .eq('id', session.user.id)

    if (error) {
      setUpgradeStatus(`❌ Failed: ${error.message}`)
    } else {
      setUpgradeStatus('✅ Pro unlocked')
    }
  }

  const fetchPages = async (userId: string) => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setPages(data || [])
  }

  const createPage = async () => {
    if (!title || !session) return

    setStatus('Checking plan...')

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', session.user.id)
      .single()

    const { count } = await supabase
      .from('pages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (!profile?.is_pro && count && count >= 1) {
      setStatus('Free plan allows only 1 page. Upgrade to Pro 🚀')
      return
    }

    setStatus('Creating page...')

    const slug = title.toLowerCase().replace(/\s+/g, '-')

    const { error } = await supabase.from('pages').insert({
      title,
      slug,
      user_id: session.user.id,
    })

    if (error) {
      setStatus(error.message)
    } else {
      setTitle('')
      setStatus(null)
      fetchPages(session.user.id)
    }
  }

  // ⏳ LOADING STATE (THIS FIXES THE WHITE SCREEN)
  if (loading) {
    return <p className="p-10">Loading dashboard…</p>
  }

  // 🔐 NOT LOGGED IN
  if (!session) {
    return <p className="p-10">Please log in.</p>
  }

  // ✅ DASHBOARD
  return (
    <main className="p-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Proofly Pages</h1>

      {success === 'true' && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          🎉 Payment successful — Pro unlocked!
          {upgradeStatus && <div className="text-sm mt-1">{upgradeStatus}</div>}
        </div>
      )}

      <div className="mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title (e.g. Web Design Clients)"
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={createPage}
          className="bg-black text-white px-4 py-2 w-full"
        >
          Create Page
        </button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </div>

      <ul className="space-y-2">
        {pages.map((page) => (
          <li key={page.id} className="border p-3 rounded">
            <strong>{page.title}</strong>
            <div className="text-sm text-gray-500">/{page.slug}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}

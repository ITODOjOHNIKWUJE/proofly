'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function TestimonialsDashboard() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in')
        return
      }

      const { data } = await supabase
        .from('testimonials')
        .select(
          `
          id,
          author_name,
          author_role,
          content,
          approved,
          created_at,
          pages (
            title,
            user_id
          )
        `
        )
        .eq('pages.user_id', user.id)
        .order('created_at', { ascending: false })

      setTestimonials(data || [])
      setLoading(false)
    }

    load()
  }, [])

  const approve = async (id: number) => {
    await supabase
      .from('testimonials')
      .update({ approved: true })
      .eq('id', id)

    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, approved: true } : t))
    )
  }

  const remove = async (id: number) => {
    await supabase.from('testimonials').delete().eq('id', id)
    setTestimonials((prev) => prev.filter((t) => t.id !== id))
  }

  if (loading) return <p className="p-10">Loading testimonials...</p>

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Testimonials</h1>

      {testimonials.length === 0 && (
        <p className="text-gray-500">No testimonials yet.</p>
      )}

      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="border p-4 rounded">
            <p className="font-semibold">
              {t.author_name}{' '}
              <span className="text-gray-500 text-sm">
                {t.author_role}
              </span>
            </p>

            <p className="mt-2">{t.content}</p>

            <p className="text-sm text-gray-500 mt-2">
              Page: {t.pages?.title}
            </p>

            <div className="mt-3 space-x-2">
              {!t.approved && (
                <button
                  onClick={() => approve(t.id)}
                  className="bg-green-600 text-white px-3 py-1"
                >
                  Approve
                </button>
              )}

              <button
                onClick={() => remove(t.id)}
                className="bg-red-600 text-white px-3 py-1"
              >
                Delete
              </button>

              {t.approved && (
                <span className="text-green-600 ml-2 font-semibold">
                  Approved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function TestimonialsDashboard() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select(`
        id,
        content,
        author_name,
        author_role,
        approved,
        pages (
          title
        )
      `)
      .eq('approved', false)
      .order('created_at', { ascending: false })

    setTestimonials(data || [])
    setLoading(false)
  }

  const approveTestimonial = async (id: string) => {
    await supabase
      .from('testimonials')
      .update({ approved: true })
      .eq('id', id)

    loadTestimonials()
  }

  useEffect(() => {
    loadTestimonials()
  }, [])

  if (loading) return <p className="p-10">Loading testimonials…</p>

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pending Testimonials</h1>

      {testimonials.length === 0 && (
        <p className="text-gray-500">No pending testimonials.</p>
      )}

      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="border p-4 rounded">
            <p className="font-semibold">{t.author_name}</p>
            {t.author_role && (
              <p className="text-sm text-gray-500">{t.author_role}</p>
            )}
            <p className="mt-2">{t.content}</p>
            <p className="text-sm text-gray-400 mt-2">
              Page: {t.pages?.title}
            </p>

            <button
              onClick={() => approveTestimonial(t.id)}
              className="mt-3 bg-black text-white px-4 py-2"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}

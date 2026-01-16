'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<any>(null)
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) return

    const load = async () => {
      setLoading(true)

      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single()

      setPage(pageData)

      if (pageData) {
        const { data: testimonialsData } = await supabase
          .from('testimonials')
          .select('*')
          .eq('page_id', pageData.id)
          .eq('approved', true)
          .order('created_at', { ascending: false })

        setTestimonials(testimonialsData || [])
      }

      setLoading(false)
    }

    load()
  }, [slug])

  if (loading) return <p className="p-10">Loading...</p>
  if (!page) return <p className="p-10">Page not found</p>

  return (
    <main className="p-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">{page.title}</h1>

      {/* Approved testimonials */}
      <section className="mb-10 space-y-4">
  <h2 className="text-xl font-semibold">Testimonials</h2>

  {testimonials.length === 0 && (
    <p className="text-gray-500">
      No testimonials yet. Share this link with your clients to collect one.
    </p>
  )}

  {testimonials.map((t) => (
    <div key={t.id} className="border p-4 rounded">
      <p className="font-semibold">
        {t.author_name}{' '}
        {t.author_role && (
          <span className="text-gray-500 text-sm">
            — {t.author_role}
          </span>
        )}
      </p>
      <p className="mt-2">{t.content}</p>
    </div>
  ))}
</section>
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-semibold">What people say</h2>

          {testimonials.map((t) => (
            <div key={t.id} className="border p-4 rounded">
              <p className="font-semibold">
                {t.author_name}{' '}
                {t.author_role && (
                  <span className="text-gray-500 text-sm">
                    — {t.author_role}
                  </span>
                )}
              </p>
              <p className="mt-2">{t.content}</p>
            </div>
          ))}
        </section>
      )}

      {/* Submission form */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Leave a testimonial</h2>

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault()
            setSubmitting(true)

            const form = e.currentTarget
            const author_name = (form.elements.namedItem('name') as HTMLInputElement).value
            const author_role = (form.elements.namedItem('role') as HTMLInputElement).value
            const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value

            const { error } = await supabase.from('testimonials').insert({
              page_id: page.id,
              author_name,
              author_role,
              content,
            })

            setSubmitting(false)

            if (error) {
              alert('Failed to submit testimonial')
            } else {
              alert('Thank you! Your testimonial was submitted for review.')
              form.reset()
            }
          }}
        >
          <input
            name="name"
            placeholder="Your name"
            className="border p-2 w-full"
            required
          />
          <input
            name="role"
            placeholder="Your role (optional)"
            className="border p-2 w-full"
          />
          <textarea
            name="content"
            placeholder="Your testimonial"
            className="border p-2 w-full"
            required
          />
          <button
            disabled={submitting}
            className="bg-black text-white px-4 py-2 w-full disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit testimonial'}
          </button>
        </form>
      </section>
    </main>
  )
}

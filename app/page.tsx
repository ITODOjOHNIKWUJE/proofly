'use client'

import { Suspense } from 'react'
import HomeClient from './home-client'

export default function Page() {
  return (
    <Suspense fallback={<p className="p-10">Loading…</p>}>
      <HomeClient />
    </Suspense>
  )
}

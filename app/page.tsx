'use client'

import { Suspense } from 'react'
import HomeClient from './home-client'

export default function Page() {
  return (
    <Suspense fallback={
  <div className="p-10">
    <p>Please log in.</p>
    <a href="/login" className="underline">Go to login</a>
  </div>
}>
      <HomeClient />
    </Suspense>
  )
}

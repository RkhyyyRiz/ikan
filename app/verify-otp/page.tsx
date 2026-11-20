import { Suspense } from 'react'
import VerifyForm from './VerifyForm'

export const metadata = { title: 'Verifikasi Email' }

export default function VerifyOtpPage() {
  return <Suspense><VerifyForm /></Suspense>
}

import Link from 'next/link'

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-lg bg-river text-white">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12c3-5 8-6 12-4l4-2-1 5 2 4-5-1c-4 2-9 1-12-2z" /><circle cx="15" cy="10" r=".6" fill="currentColor" />
        </svg>
      </span>
      <span className="font-display text-[17px] font-bold leading-tight">Budi Daya<br />Ikan Kalbar</span>
    </Link>
  )
}

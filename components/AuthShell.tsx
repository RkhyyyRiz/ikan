import Logo from './Logo'

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <Logo />
      <div className="mt-10">
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] text-mute">{subtitle}</p>}
      </div>
      <div className="mt-6">{children}</div>
    </main>
  )
}

import { ORDER_STATUS_LABEL } from '@/lib/format'
import type { OrderStatus } from '@/lib/types'

const STEPS: OrderStatus[] = ['pending', 'preparing', 'delivering', 'completed']

export default function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return <p className="rounded-xl bg-merah-soft px-4 py-3 font-semibold text-merah">Pesanan ini dibatalkan.</p>
  const current = STEPS.indexOf(status)
  return (
    <ol className="grid grid-cols-4 gap-1">
      {STEPS.map((s, i) => {
        const done = i <= current
        return (
          <li key={s} className="flex flex-col items-center text-center" aria-current={i === current ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? 'bg-transparent' : i <= current ? 'bg-river' : 'bg-line'}`} />
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${done ? 'border-river bg-river text-white' : 'border-line bg-card text-mute'}`}>{done ? '✓' : ''}</span>
              <span className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? 'bg-transparent' : i < current ? 'bg-river' : 'bg-line'}`} />
            </div>
            <span className={`mt-2 text-xs leading-tight ${i === current ? 'font-bold text-ink' : 'text-mute'}`}>{ORDER_STATUS_LABEL[s]}</span>
          </li>
        )
      })}
    </ol>
  )
}

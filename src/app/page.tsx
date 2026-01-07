import { HydrationGuard } from '@/components/HydrationGuard'
import { AppLayout } from '@/components/layout/AppLayout'

export default function Home() {
  return (
    <HydrationGuard>
      <AppLayout />
    </HydrationGuard>
  )
}

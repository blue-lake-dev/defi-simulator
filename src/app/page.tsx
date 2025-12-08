import { HydrationGuard } from '@/components/HydrationGuard'
import { AppLayout } from '@/components/layout/AppLayout'
import { PortfolioTab } from '@/components/tabs/PortfolioTab'
import { EthProductsTab } from '@/components/tabs/EthProductsTab'
import { StablecoinProductsTab } from '@/components/tabs/StablecoinProductsTab'
import { HedgeTab } from '@/components/tabs/HedgeTab'

export default function Home() {
  return (
    <HydrationGuard>
      <AppLayout
        portfolioContent={<PortfolioTab />}
        ethContent={<EthProductsTab />}
        stablecoinContent={<StablecoinProductsTab />}
        hedgeContent={<HedgeTab />}
      />
    </HydrationGuard>
  )
}

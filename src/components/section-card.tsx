import { MetricCard } from "@/components/metric-card"
import { TrendingDown, TrendingUp } from "lucide-react"

export function SectionCards() {
  return (
    <div className="flex gap-0.5 overflow-hidden *:data-[slot=card]:shadow-xs *:flex-1 *:shrink">
      <MetricCard title="Total Revenue" value="$1,250.00" trend="+12.5%" link="/revenue">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <TrendingDown className="size-4" />
        </div>
      </MetricCard>

      <MetricCard title="New Customers" value="1,234" trend="-20%" link="/customers">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Down 20% this period <TrendingUp className="size-4" />
        </div>
      </MetricCard>

      {/* <MetricCard title="Active Accounts" value="45,678" trend="+12.5%" link="/accounts">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Strong user retention <TrendingUp className="size-4" />
        </div>
      </MetricCard>

      <MetricCard title="Growth Rate" value="4.5%" trend="+4.5%" link="/growth">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Steady performance increase <TrendingUp className="size-4" />
        </div>
      </MetricCard> */}
    </div>
  )
}

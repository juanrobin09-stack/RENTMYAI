import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export interface AgentCardData {
  slug: string;
  name: string;
  tagline: string | null;
  avatar: string | null;
  category: { name: string } | null;
  pricingModel: "FREE" | "SUBSCRIPTION" | "ONE_TIME";
  priceMonthly: number;
  priceOneTime: number;
  ratingAvg: number;
  ratingCount: number;
  usageCount: number;
}

function priceLabel(a: AgentCardData) {
  if (a.pricingModel === "FREE") return "Gratuit";
  if (a.pricingModel === "SUBSCRIPTION")
    return `${formatPrice(a.priceMonthly)}/mois`;
  return formatPrice(a.priceOneTime);
}

export function AgentCard({ agent }: { agent: AgentCardData }) {
  return (
    <Link href={`/agents/${agent.slug}`} className="group">
      <Card className="h-full p-5 transition hover:border-primary/40 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-lg font-semibold">
            {agent.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
            ) : (
              agent.name.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold group-hover:text-primary">
              {agent.name}
            </h3>
            {agent.category && (
              <p className="text-xs text-muted-foreground">{agent.category.name}</p>
            )}
          </div>
          <Badge variant="secondary">{priceLabel(agent)}</Badge>
        </div>

        {agent.tagline && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {agent.tagline}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {agent.ratingAvg.toFixed(1)} ({agent.ratingCount})
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {agent.usageCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}

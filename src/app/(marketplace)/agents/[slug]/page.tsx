import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, MessageSquare, Users, FileText } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/reviews/stars";
import { ReviewList } from "@/components/reviews/review-list";
import { RentButton } from "@/components/marketplace/rent-button";
import { getCurrentSession } from "@/server/auth";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

async function getAgent(slug: string) {
  return db.agent
    .findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        creator: { select: { name: true, image: true } },
        category: { select: { name: true, slug: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { name: true, image: true } } },
        },
        _count: { select: { documents: true } },
      },
    })
    .catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgent(slug);
  if (!agent) return { title: "IA introuvable" };
  return {
    title: agent.name,
    description: agent.tagline ?? agent.description ?? `Discute avec ${agent.name}, une IA experte.`,
    openGraph: {
      title: agent.name,
      description: agent.tagline ?? "",
      images: agent.coverImage ? [agent.coverImage] : undefined,
    },
  };
}

function priceLabel(a: { pricingModel: string; priceMonthly: number; priceOneTime: number }) {
  if (a.pricingModel === "FREE") return "Gratuit";
  if (a.pricingModel === "SUBSCRIPTION") return `${formatPrice(a.priceMonthly)}/mois`;
  return `${formatPrice(a.priceOneTime)} à vie`;
}

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = await getAgent(slug);
  if (!agent) notFound();

  const session = await getCurrentSession();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: agent.name,
    description: agent.tagline ?? agent.description ?? "",
    aggregateRating:
      agent.ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: agent.ratingAvg.toFixed(1),
            reviewCount: agent.ratingCount,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      price: ((agent.pricingModel === "SUBSCRIPTION" ? agent.priceMonthly : agent.priceOneTime) / 100).toFixed(2),
      priceCurrency: "EUR",
    },
  };

  return (
    <div className="container py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-2xl font-semibold">
              {agent.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.avatar} alt={agent.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                agent.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{agent.name}</h1>
                {agent.featured && <Badge variant="warning">⭐ Featured</Badge>}
              </div>
              {agent.category && (
                <Badge variant="secondary" className="mt-1">{agent.category.name}</Badge>
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                par {agent.creator.name ?? "Créateur"}
              </p>
            </div>
          </div>

          {agent.tagline && <p className="mt-6 text-lg">{agent.tagline}</p>}
          {agent.description && (
            <p className="mt-4 whitespace-pre-wrap text-muted-foreground">{agent.description}</p>
          )}

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {agent.ratingAvg.toFixed(1)} ({agent.ratingCount} avis)
            </span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{agent.subscriberCount} abonnés</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{agent.usageCount} conversations</span>
            <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" />{agent._count.documents} sources</span>
          </div>

          {/* Avis */}
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Avis</h2>
            <ReviewList reviews={agent.reviews} />
          </div>
        </div>

        {/* Sidebar pricing */}
        <div>
          <Card className="sticky top-24 p-6">
            <div className="text-2xl font-bold">{priceLabel(agent)}</div>
            {agent.trialDays > 0 && agent.pricingModel === "SUBSCRIPTION" && (
              <p className="mt-1 text-sm text-emerald-600">
                {agent.trialDays} jours d'essai gratuit
              </p>
            )}
            <div className="mt-4">
              <RentButton
                agentId={agent.id}
                pricingModel={agent.pricingModel}
                isAuthed={Boolean(session?.user)}
                label={
                  agent.pricingModel === "FREE"
                    ? "Discuter gratuitement"
                    : agent.pricingModel === "SUBSCRIPTION"
                      ? "S'abonner"
                      : "Acheter l'accès"
                }
              />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Stars value={agent.ratingAvg} size={14} />
              <span className="text-xs text-muted-foreground">{agent.ratingCount} avis</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

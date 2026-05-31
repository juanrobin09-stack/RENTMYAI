import { CheckCircle2, CreditCard } from "lucide-react";
import { requireUser } from "@/server/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "@/components/studio/connect-button";

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const user = await requireUser();
  const me = await db.user.findUnique({
    where: { id: user.id },
    select: { payoutsEnabled: true, stripeConnectEnabled: true },
  });

  return (
    <div className="container max-w-xl py-12">
      <div className="flex items-center gap-3">
        <CreditCard className="h-7 w-7" />
        <h1 className="text-3xl font-bold">Paiements</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Connecte ton compte Stripe pour recevoir tes revenus automatiquement.
      </p>

      <Card className="mt-8 p-6">
        <div className="flex items-center justify-between">
          <span className="font-medium">Statut du compte</span>
          {me?.payoutsEnabled ? (
            <Badge variant="success"><CheckCircle2 className="mr-1 h-3 w-3" />Actif</Badge>
          ) : (
            <Badge variant="warning">Non configuré</Badge>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          RentMyAI prélève une commission de {process.env.PLATFORM_FEE_PERCENT ?? 20}% ;
          le reste t'est versé directement par Stripe.
        </p>
        <div className="mt-6">
          <ConnectButton enabled={Boolean(me?.payoutsEnabled)} />
        </div>
      </Card>
    </div>
  );
}

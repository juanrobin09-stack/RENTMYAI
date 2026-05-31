import { Stars } from "./stars";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { name: string | null; image: string | null };
}

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun avis pour le moment.</p>;
  }
  return (
    <div className="space-y-5">
      {reviews.map((r) => (
        <div key={r.id} className="border-b border-border pb-5 last:border-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{r.user.name ?? "Utilisateur"}</span>
            <Stars value={r.rating} size={14} />
          </div>
          {r.comment && (
            <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}

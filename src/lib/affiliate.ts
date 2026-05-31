import { db } from "@/lib/db";
import { customAlphabet } from "nanoid";

const genCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

/** Garantit que l'utilisateur possède un code d'affiliation unique. */
export async function ensureAffiliateCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { affiliateCode: true },
  });
  if (user?.affiliateCode) return user.affiliateCode;

  // Réessaie en cas de collision (très improbable).
  for (let i = 0; i < 5; i++) {
    const code = genCode();
    try {
      await db.user.update({ where: { id: userId }, data: { affiliateCode: code } });
      return code;
    } catch {
      /* collision -> retry */
    }
  }
  throw new Error("Impossible de générer un code d'affiliation");
}

export function affiliateUrl(code: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/?ref=${code}`;
}

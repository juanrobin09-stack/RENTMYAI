import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // better-auth tire des dialectes (sqlite/kysely) qu'on n'utilise pas (adapter Prisma).
  // On les externalise pour éviter que webpack ne tente de résoudre leurs imports optionnels.
  serverExternalPackages: ["pdf-parse", "better-auth", "@better-auth/kysely-adapter", "kysely"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;

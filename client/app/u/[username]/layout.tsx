import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — Developer Profile`,
    description: `Browse @${username}'s public AI-generated architecture showcases, aggregated tech stack, and security health on BuildFolio.`,
    openGraph: {
      title: `@${username} — Developer Profile | BuildFolio`,
      description: `Browse @${username}'s public engineering showcases and aggregated tech stack.`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `@${username} — Developer Profile | BuildFolio`,
      description: `Browse @${username}'s public engineering showcases on BuildFolio.`,
    },
  };
}

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

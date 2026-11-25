import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Architecture Showcase",
  description:
    "Explore AI-generated architecture diagrams, tech stack breakdown, and engineering highlights on BuildFolio.",
  openGraph: {
    title: "Project Architecture Showcase | BuildFolio",
    description:
      "Explore AI-generated architecture diagrams, tech stack breakdown, and engineering highlights.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Architecture Showcase | BuildFolio",
    description:
      "Explore AI-generated architecture diagrams and engineering highlights on BuildFolio.",
  },
};

export default function PublicPortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

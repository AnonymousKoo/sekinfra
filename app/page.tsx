import type { Metadata } from "next";
import { PremiumHome } from "@/components/landing/premium-home";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <PremiumHome />;
}

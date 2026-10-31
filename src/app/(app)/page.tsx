import Home from "@/components/Home";
import { homeAlternates } from "@/lib/seo";

export const metadata = { alternates: { canonical: "/", languages: homeAlternates() } };

export default function Page() {
  return <Home />;
}

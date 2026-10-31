import Shell from "@/components/Shell";
import RootDocument from "@/components/RootDocument";
import { LangProvider } from "@/lib/i18n";
import { defaultMetadata, viewport as sharedViewport } from "@/lib/seo";

// Everything except the per-language home pages: /, /new, /m/<id>, /mine, /privacy, /terms, /safety.
// The language is chosen in the browser here, because these pages (secret links especially) must keep one address.
export const metadata = defaultMetadata;
export const viewport = sharedViewport;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <RootDocument lang="en">
      <LangProvider>
        <Shell>{children}</Shell>
      </LangProvider>
    </RootDocument>
  );
}

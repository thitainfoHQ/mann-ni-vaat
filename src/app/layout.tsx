import type { Metadata, Viewport } from "next";
import {
  Baloo_2,
  Baloo_Bhai_2,
  Hind,
  Hind_Vadodara,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Meetei_Mayek,
  Noto_Sans_Ol_Chiki,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import Shell from "@/components/Shell";
import AnalyticsScrubbed from "@/components/AnalyticsScrubbed";
import "./globals.css";

// Each script gets its own purpose-made family; the CSS picks the order per language.
const baloo2 = Baloo_2({ variable: "--f-baloo2", subsets: ["latin", "devanagari"], weight: ["500", "700"], display: "swap" });
const balooBhai = Baloo_Bhai_2({ variable: "--f-baloobhai", subsets: ["latin", "gujarati"], weight: ["500", "700"], display: "swap" });
const hind = Hind({ variable: "--f-hind", subsets: ["latin", "devanagari"], weight: ["400", "600"], display: "swap" });
const vadodara = Hind_Vadodara({ variable: "--f-vadodara", subsets: ["latin", "gujarati"], weight: ["400", "600"], display: "swap" });

// Scripts without a purpose-made display family use Noto. They are only declared here: the browser downloads a
// font file the first time a character from its script appears, so visitors pay only for the language they use.
const notoBengali = Noto_Sans_Bengali({ variable: "--f-n-bn", subsets: ["bengali"], display: "swap", preload: false });
const notoGurmukhi = Noto_Sans_Gurmukhi({ variable: "--f-n-pa", subsets: ["gurmukhi"], display: "swap", preload: false });
const notoOriya = Noto_Sans_Oriya({ variable: "--f-n-or", subsets: ["oriya"], display: "swap", preload: false });
const notoTamil = Noto_Sans_Tamil({ variable: "--f-n-ta", subsets: ["tamil"], display: "swap", preload: false });
const notoTelugu = Noto_Sans_Telugu({ variable: "--f-n-te", subsets: ["telugu"], display: "swap", preload: false });
const notoKannada = Noto_Sans_Kannada({ variable: "--f-n-kn", subsets: ["kannada"], display: "swap", preload: false });
const notoMalayalam = Noto_Sans_Malayalam({ variable: "--f-n-ml", subsets: ["malayalam"], display: "swap", preload: false });
const notoArabic = Noto_Naskh_Arabic({ variable: "--f-n-ar", subsets: ["arabic"], display: "swap", preload: false });
const notoOlChiki = Noto_Sans_Ol_Chiki({ variable: "--f-n-sat", subsets: ["ol-chiki"], display: "swap", preload: false });
const notoMeetei = Noto_Sans_Meetei_Mayek({ variable: "--f-n-mni", subsets: ["meetei-mayek"], display: "swap", preload: false });
const notoVars = [notoBengali, notoGurmukhi, notoOriya, notoTamil, notoTelugu, notoKannada, notoMalayalam, notoArabic, notoOlChiki, notoMeetei]
  .map((f) => f.variable)
  .join(" ");

// Absolute URL for the link-preview image. Set NEXT_PUBLIC_SITE_URL once the real domain is live.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const description = "Send a secret message or drawing that opens once and then disappears. Encrypted in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Mann Ni Vaat · મનની વાત",
  description,
  openGraph: { title: "Mann Ni Vaat · મનની વાત", description, siteName: "Mann Ni Vaat", type: "website" },
  twitter: { card: "summary_large_image", title: "Mann Ni Vaat", description },
};

export const viewport: Viewport = { themeColor: "#15143a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${baloo2.variable} ${balooBhai.variable} ${hind.variable} ${vadodara.variable} ${notoVars}`}
    >
      <body className="min-h-dvh">
        <LangProvider>
          <Shell>{children}</Shell>
        </LangProvider>
        <AnalyticsScrubbed />
      </body>
    </html>
  );
}

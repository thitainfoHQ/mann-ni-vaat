import type { Metadata, Viewport } from "next";
import { Baloo_2, Baloo_Bhai_2, Hind, Hind_Vadodara } from "next/font/google";
import { LangProvider } from "@/lib/i18n";
import Shell from "@/components/Shell";
import "./globals.css";

// Each script gets its own purpose-made family; the CSS picks the order per language.
const baloo2 = Baloo_2({ variable: "--f-baloo2", subsets: ["latin", "devanagari"], weight: ["500", "700"], display: "swap" });
const balooBhai = Baloo_Bhai_2({ variable: "--f-baloobhai", subsets: ["latin", "gujarati"], weight: ["500", "700"], display: "swap" });
const hind = Hind({ variable: "--f-hind", subsets: ["latin", "devanagari"], weight: ["400", "600"], display: "swap" });
const vadodara = Hind_Vadodara({ variable: "--f-vadodara", subsets: ["latin", "gujarati"], weight: ["400", "600"], display: "swap" });

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
      className={`${baloo2.variable} ${balooBhai.variable} ${hind.variable} ${vadodara.variable}`}
    >
      <body className="min-h-dvh">
        <LangProvider>
          <Shell>{children}</Shell>
        </LangProvider>
      </body>
    </html>
  );
}

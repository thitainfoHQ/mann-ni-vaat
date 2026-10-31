import type { Metadata } from "next";
import NotFoundView from "@/components/NotFoundView";
import { fontClasses } from "./fonts";
import "./globals.css";

// Shown for any address that matches no page, in the app's own look (not the framework default).
// It bypasses the normal layouts, so it brings its own html, fonts and styles.
export const metadata: Metadata = { title: "Page not found · Mann Ni Vaat" };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontClasses} style={{ backgroundColor: "#15143a" }}>
      <body className="min-h-dvh">
        <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
          <NotFoundView />
        </main>
      </body>
    </html>
  );
}

import type { ReactNode } from "react";

// Every page except the home pages is a single readable column. (The home pages use the full width.)
export default function InnerLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-xl">{children}</div>;
}

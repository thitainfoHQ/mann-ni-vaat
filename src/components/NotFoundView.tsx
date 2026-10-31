import Link from "next/link";
import Knot from "@/components/Knot";

/** The app's own "not found", shared by the in-layout 404 and the global one. English only: there is no language to rely on here. */
export default function NotFoundView() {
  return (
    <div className="flex flex-col items-center pt-16 text-center">
      <Knot className="size-16" />
      <h1 className="mt-6 text-3xl font-bold">This page isn&apos;t here.</h1>
      <p className="mt-2 max-w-[40ch] text-abhla-dim">The link may be wrong, or the page has moved. Your secrets are safe either way.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-bandhani px-6 font-display text-lg font-bold text-white transition-colors hover:bg-bandhani-dark"
      >
        Go to Mann Ni Vaat
      </Link>
    </div>
  );
}

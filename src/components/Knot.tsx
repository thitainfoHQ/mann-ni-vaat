// The brand mark: a knot tied in bandhani cloth. Colours come from the theme variables, so it follows the look.
export default function Knot({ className = "size-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="var(--cloth-knot)" />
      <path
        d="M20 38c0-9 7-15 14-15 6 0 10 4 10 9 0 6-5 9-10 9-4 0-7-2-7-5 0-3 2-5 5-5"
        fill="none"
        stroke="var(--cloth-dot)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="2.5" fill="var(--cloth-dot)" />
    </svg>
  );
}

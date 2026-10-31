// A legal page is a list of blocks so every language shares one layout.
// Inline markup: `code` renders as <code>; {email} renders as the contact mailto link.
export type Block = { h: string } | { p: string } | { ul: string[] };
export type LegalDoc = { title: string; updated: string; blocks: Block[] };
// `safety` is English-only for now; other languages fall back to English until it is translated.
export type Legal = { privacy: LegalDoc; terms: LegalDoc; safety?: LegalDoc };

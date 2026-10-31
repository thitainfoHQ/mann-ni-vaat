// Visible "how it works" and FAQ text on the home page. It is real page content (not hidden markup), so search engines
// and AI answer engines can quote it, and it feeds the FAQ structured data. Languages without a translation show no
// such section rather than English text on a translated page.
export type HomeContent = {
  howTitle: string;
  steps: { title: string; body: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

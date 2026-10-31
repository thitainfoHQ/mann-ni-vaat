import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Safety · Mann Ni Vaat",
  description: "How to stay safe with secret messages, what is not allowed, and how to report abuse.",
  alternates: { canonical: "/safety" },
};

export default function Safety() {
  return <LegalPage doc="safety" />;
}

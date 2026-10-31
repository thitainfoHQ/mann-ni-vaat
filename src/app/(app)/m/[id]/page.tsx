import { Suspense } from "react";
import Receiver from "@/components/Receiver";

export const metadata = {
  title: "A secret is waiting · Mann Ni Vaat",
  // The link is for one person. Keep it out of search results and previews.
  robots: { index: false, follow: false },
};

async function ReceiverForId({ params }: { params: PageProps<"/m/[id]">["params"] }) {
  const { id } = await params;
  return <Receiver id={id} />;
}

export default function OpenSecret({ params }: PageProps<"/m/[id]">) {
  return (
    <Suspense>
      <ReceiverForId params={params} />
    </Suspense>
  );
}

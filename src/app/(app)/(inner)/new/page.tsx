import { Suspense } from "react";
import Composer from "@/components/Composer";
import Loading from "@/components/Loading";

export const metadata = {
  title: "Send a secret · Mann Ni Vaat",
  description: "Write a message or draw a picture, lock it in your browser and send a link that opens only once. Free, no account.",
  alternates: { canonical: "/new" },
};

export default function NewSecret() {
  // Composer reads ?type= on the client, which needs a Suspense boundary.
  return (
    <Suspense fallback={<Loading />}>
      <Composer />
    </Suspense>
  );
}

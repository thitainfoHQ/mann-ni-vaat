import { Suspense } from "react";
import Composer from "@/components/Composer";

export const metadata = { title: "Send a secret · Mann Ni Vaat" };

export default function NewSecret() {
  // Composer reads ?type= on the client, which needs a Suspense boundary.
  return (
    <Suspense>
      <Composer />
    </Suspense>
  );
}

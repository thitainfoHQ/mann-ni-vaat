import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Mann Ni Vaat: a secret that opens once";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}

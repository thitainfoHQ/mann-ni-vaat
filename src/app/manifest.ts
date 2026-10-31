import type { MetadataRoute } from "next";

// Lets the site be added to a phone's home screen with its own name, icon and colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mann Ni Vaat · મનની વાત",
    short_name: "Mann Ni Vaat",
    description: "Send a secret message or drawing that opens once and then disappears.",
    start_url: "/",
    display: "standalone",
    background_color: "#15143a",
    theme_color: "#15143a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

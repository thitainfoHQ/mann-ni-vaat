import {
  Baloo_2,
  Baloo_Bhai_2,
  Hind,
  Hind_Vadodara,
  Noto_Naskh_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Malayalam,
  Noto_Sans_Meetei_Mayek,
  Noto_Sans_Ol_Chiki,
  Noto_Sans_Oriya,
  Noto_Sans_Tamil,
  Noto_Sans_Telugu,
} from "next/font/google";

// Each script gets its own purpose-made family; the CSS picks the order per language.
const baloo2 = Baloo_2({ variable: "--f-baloo2", subsets: ["latin", "devanagari"], weight: ["500", "700"], display: "swap" });
const balooBhai = Baloo_Bhai_2({ variable: "--f-baloobhai", subsets: ["latin", "gujarati"], weight: ["500", "700"], display: "swap" });
const hind = Hind({ variable: "--f-hind", subsets: ["latin", "devanagari"], weight: ["400", "600"], display: "swap" });
const vadodara = Hind_Vadodara({ variable: "--f-vadodara", subsets: ["latin", "gujarati"], weight: ["400", "600"], display: "swap" });

// Scripts without a purpose-made display family use Noto. They are only declared here: the browser downloads a
// font file the first time a character from its script appears, so visitors pay only for the language they use.
const notoBengali = Noto_Sans_Bengali({ variable: "--f-n-bn", subsets: ["bengali"], display: "swap", preload: false });
const notoGurmukhi = Noto_Sans_Gurmukhi({ variable: "--f-n-pa", subsets: ["gurmukhi"], display: "swap", preload: false });
const notoOriya = Noto_Sans_Oriya({ variable: "--f-n-or", subsets: ["oriya"], display: "swap", preload: false });
const notoTamil = Noto_Sans_Tamil({ variable: "--f-n-ta", subsets: ["tamil"], display: "swap", preload: false });
const notoTelugu = Noto_Sans_Telugu({ variable: "--f-n-te", subsets: ["telugu"], display: "swap", preload: false });
const notoKannada = Noto_Sans_Kannada({ variable: "--f-n-kn", subsets: ["kannada"], display: "swap", preload: false });
const notoMalayalam = Noto_Sans_Malayalam({ variable: "--f-n-ml", subsets: ["malayalam"], display: "swap", preload: false });
const notoArabic = Noto_Naskh_Arabic({ variable: "--f-n-ar", subsets: ["arabic"], display: "swap", preload: false });
const notoOlChiki = Noto_Sans_Ol_Chiki({ variable: "--f-n-sat", subsets: ["ol-chiki"], display: "swap", preload: false });
const notoMeetei = Noto_Sans_Meetei_Mayek({ variable: "--f-n-mni", subsets: ["meetei-mayek"], display: "swap", preload: false });
export const notoVars = [notoBengali, notoGurmukhi, notoOriya, notoTamil, notoTelugu, notoKannada, notoMalayalam, notoArabic, notoOlChiki, notoMeetei]
  .map((f) => f.variable)
  .join(" ");

/** CSS variable classes for every font, applied on <html>. */
export const fontClasses = `${baloo2.variable} ${balooBhai.variable} ${hind.variable} ${vadodara.variable} ${notoVars}`;

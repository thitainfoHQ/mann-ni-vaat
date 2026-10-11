"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "gu";
export const LANGS: { code: Lang; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिं", name: "हिन्दी" },
  { code: "gu", label: "ગુ", name: "ગુજરાતી" },
];

const en = {
  brand: "Mann Ni Vaat",
  brandScript: "Mann Ni Vaat",
  tagline: "What's in your heart, just once.",
  intro:
    "Write a message or draw a picture. It's locked in your browser, opens once for whoever has the link, then disappears.",
  writeCta: "Write a secret",
  drawCta: "Draw a secret",
  fact1: "Locked in your browser. We can't read it.",
  fact2: "Opens once, then it's deleted.",
  fact3: "Unopened secrets vanish after 7 days.",
  demoOpened: "You just opened a secret. Yours will open like this too.",
  demoAgain: "Tie it again",
  demoHint: "Tap the cloth to try it",

  tabWrite: "Write",
  tabDraw: "Draw",
  messageLabel: "Your message",
  messagePlaceholder: "Type what you want to say…",
  drawLabel: "Your drawing",
  colour: "Colour",
  brush: "Brush size",
  eraser: "Eraser",
  undo: "Undo",
  clear: "Clear",
  phraseToggle: "Add a secret phrase",
  phraseHelp: "They'll need the link and the phrase. Tell them the phrase some other way, not in the same chat.",
  phraseLabel: "Secret phrase",
  hintLabel: "Hint for them (optional)",
  hintHelp: "Anyone with the link can read the hint. Don't put the phrase in it.",
  consent:
    "I've read the Privacy Policy and Terms. I know screenshots and photos of the screen can't be prevented, and I'm responsible for what I send.",
  privacy: "Privacy Policy",
  terms: "Terms",
  create: "Create secret link",
  creating: "Locking it…",
  errEmptyText: "Write something first.",
  errEmptyDraw: "Draw something first.",
  errPhraseShort: "Use at least 4 characters for the phrase.",
  errConsent: "Tick the box to continue.",
  errTooLarge: "This drawing is too detailed to send. Clear some of it and try again.",
  errNetwork: "Couldn't reach the server. Check your connection and try again.",
  errRate: "Too many secrets from your network. Try again in an hour.",
  errGeneric: "Something went wrong. Try again.",

  readyTitle: "Your link is ready",
  readyNote: "It works once. Whoever opens it first sees it, so send it only to the person you mean.",
  readyPhrase: "Don't forget to tell them the secret phrase, separately from this link.",
  whatsapp: "Share on WhatsApp",
  copy: "Copy link",
  copied: "Copied",
  another: "Make another",
  shareText: "I have something to tell you. This link opens only once:",

  checking: "Checking the link…",
  goneTitle: "This secret is gone.",
  goneBody: "It was already opened, it expired after 7 days, or the link isn't right.",
  goneCta: "Send a secret",
  incompleteTitle: "This link is incomplete.",
  incompleteBody: "The part after the # is missing. Ask for the full link again.",
  waitingTitle: "A secret is waiting for you",
  waitingBody:
    "It opens once. When you untie the knot it's deleted from our server. If you leave this page afterwards, it's gone for good.",
  hintPrefix: "Hint",
  phraseEnter: "Enter the secret phrase",
  untie: "Untie the knot",
  untying: "Opening…",
  errWrongPhrase: "That phrase doesn't open it. Try again.",
  errBroken: "Couldn't unlock this secret. The link may be incomplete or damaged.",
  openedNote: "It's deleted from our server now. If you leave or refresh this page, it's gone.",
  sendBack: "Send one back",

  footContact: "Contact",
  footNote: "For learning, education and entertainment.",
  langLabel: "Language",
};

const hi: typeof en = {
  brand: "Mann Ni Vaat",
  brandScript: "Mann Ni Vaat",
  tagline: "दिल की बात, बस एक बार।",
  intro:
    "संदेश लिखें या चित्र बनाएँ। यह आपके ब्राउज़र में ही लॉक हो जाता है, लिंक वाले के लिए सिर्फ़ एक बार खुलता है, और फिर गायब हो जाता है।",
  writeCta: "संदेश लिखें",
  drawCta: "चित्र बनाएँ",
  fact1: "आपके ब्राउज़र में लॉक होता है। हम इसे पढ़ नहीं सकते।",
  fact2: "सिर्फ़ एक बार खुलता है, फिर डिलीट हो जाता है।",
  fact3: "न खुले संदेश 7 दिन बाद गायब हो जाते हैं।",
  demoOpened: "आपने अभी एक राज़ खोला। आपका भी ऐसे ही खुलेगा।",
  demoAgain: "फिर से बाँधें",
  demoHint: "आज़माने के लिए कपड़े को छुएँ",

  tabWrite: "लिखें",
  tabDraw: "बनाएँ",
  messageLabel: "आपका संदेश",
  messagePlaceholder: "जो कहना है, यहाँ लिखें…",
  drawLabel: "आपका चित्र",
  colour: "रंग",
  brush: "ब्रश का आकार",
  eraser: "रबर",
  undo: "वापस",
  clear: "साफ़ करें",
  phraseToggle: "गुप्त वाक्यांश जोड़ें",
  phraseHelp: "उन्हें लिंक और वाक्यांश, दोनों चाहिए होंगे। वाक्यांश किसी और तरीक़े से बताएँ, उसी चैट में नहीं।",
  phraseLabel: "गुप्त वाक्यांश",
  hintLabel: "उनके लिए संकेत (वैकल्पिक)",
  hintHelp: "लिंक वाला कोई भी संकेत पढ़ सकता है। इसमें वाक्यांश न लिखें।",
  consent:
    "मैंने गोपनीयता नीति और शर्तें पढ़ ली हैं। मैं जानता/जानती हूँ कि स्क्रीनशॉट और स्क्रीन की फ़ोटो को रोका नहीं जा सकता, और जो भेजता/भेजती हूँ उसकी ज़िम्मेदारी मेरी है।",
  privacy: "गोपनीयता नीति",
  terms: "शर्तें",
  create: "गुप्त लिंक बनाएँ",
  creating: "लॉक हो रहा है…",
  errEmptyText: "पहले कुछ लिखें।",
  errEmptyDraw: "पहले कुछ बनाएँ।",
  errPhraseShort: "वाक्यांश में कम से कम 4 अक्षर रखें।",
  errConsent: "आगे बढ़ने के लिए बॉक्स पर टिक करें।",
  errTooLarge: "यह चित्र भेजने के लिए बहुत भारी है। कुछ हिस्सा मिटाकर फिर कोशिश करें।",
  errNetwork: "सर्वर से जुड़ नहीं पाए। कनेक्शन जाँचकर फिर कोशिश करें।",
  errRate: "आपके नेटवर्क से बहुत ज़्यादा संदेश बने। एक घंटे बाद फिर कोशिश करें।",
  errGeneric: "कुछ गड़बड़ हो गई। फिर कोशिश करें।",

  readyTitle: "आपका लिंक तैयार है",
  readyNote: "यह सिर्फ़ एक बार काम करता है। जो पहले खोलेगा वही देखेगा, इसलिए इसे सिर्फ़ उसी को भेजें जिसके लिए है।",
  readyPhrase: "गुप्त वाक्यांश इस लिंक से अलग, किसी और तरीक़े से बताना न भूलें।",
  whatsapp: "WhatsApp पर भेजें",
  copy: "लिंक कॉपी करें",
  copied: "कॉपी हो गया",
  another: "एक और बनाएँ",
  shareText: "मुझे तुम्हें कुछ बताना है। यह लिंक सिर्फ़ एक बार खुलेगा:",

  checking: "लिंक जाँच रहे हैं…",
  goneTitle: "यह राज़ अब नहीं रहा।",
  goneBody: "यह पहले ही खोला जा चुका है, 7 दिन में एक्सपायर हो गया, या लिंक सही नहीं है।",
  goneCta: "एक राज़ भेजें",
  incompleteTitle: "यह लिंक अधूरा है।",
  incompleteBody: "# के बाद का हिस्सा गायब है। पूरा लिंक दोबारा माँगें।",
  waitingTitle: "आपके लिए एक राज़ इंतज़ार कर रहा है",
  waitingBody:
    "यह एक बार ही खुलता है। गाँठ खोलते ही यह हमारे सर्वर से डिलीट हो जाता है। बाद में पेज छोड़ दिया तो यह हमेशा के लिए चला जाएगा।",
  hintPrefix: "संकेत",
  phraseEnter: "गुप्त वाक्यांश लिखें",
  untie: "गाँठ खोलें",
  untying: "खुल रहा है…",
  errWrongPhrase: "इस वाक्यांश से नहीं खुला। फिर कोशिश करें।",
  errBroken: "यह राज़ नहीं खुल पाया। लिंक अधूरा या ख़राब हो सकता है।",
  openedNote: "अब यह हमारे सर्वर से डिलीट हो चुका है। पेज छोड़ा या रिफ़्रेश किया तो यह चला जाएगा।",
  sendBack: "एक वापस भेजें",

  footContact: "संपर्क",
  footNote: "सीखने, शिक्षा और मनोरंजन के लिए।",
  langLabel: "भाषा",
};

const gu: typeof en = {
  brand: "Mann Ni Vaat",
  brandScript: "મનની વાત",
  tagline: "મનની વાત, બસ એક વાર.",
  intro:
    "સંદેશ લખો કે ચિત્ર દોરો. તે તમારા બ્રાઉઝરમાં જ લૉક થાય છે, લિંક ધરાવનાર માટે એક જ વાર ખૂલે છે, અને પછી ગાયબ થઈ જાય છે.",
  writeCta: "સંદેશ લખો",
  drawCta: "ચિત્ર દોરો",
  fact1: "તમારા બ્રાઉઝરમાં લૉક થાય છે. અમે વાંચી શકતા નથી.",
  fact2: "એક જ વાર ખૂલે છે, પછી ડિલીટ થઈ જાય છે.",
  fact3: "ન ખૂલેલા સંદેશ 7 દિવસ પછી ગાયબ થઈ જાય છે.",
  demoOpened: "તમે હમણાં એક રહસ્ય ખોલ્યું. તમારું પણ આમ જ ખૂલશે.",
  demoAgain: "ફરી બાંધો",
  demoHint: "અજમાવવા કપડાને અડો",

  tabWrite: "લખો",
  tabDraw: "દોરો",
  messageLabel: "તમારો સંદેશ",
  messagePlaceholder: "જે કહેવું છે તે અહીં લખો…",
  drawLabel: "તમારું ચિત્ર",
  colour: "રંગ",
  brush: "બ્રશનું કદ",
  eraser: "રબર",
  undo: "પાછળ",
  clear: "સાફ કરો",
  phraseToggle: "ગુપ્ત વાક્ય ઉમેરો",
  phraseHelp: "તેમને લિંક અને વાક્ય, બંને જોઈશે. વાક્ય બીજી રીતે કહો, એ જ ચેટમાં નહીં.",
  phraseLabel: "ગુપ્ત વાક્ય",
  hintLabel: "તેમના માટે સંકેત (વૈકલ્પિક)",
  hintHelp: "લિંક ધરાવનાર કોઈ પણ સંકેત વાંચી શકે છે. તેમાં વાક્ય ન લખો.",
  consent:
    "મેં ગોપનીયતા નીતિ અને શરતો વાંચી છે. હું જાણું છું કે સ્ક્રીનશોટ અને સ્ક્રીનના ફોટા રોકી શકાતા નથી, અને હું જે મોકલું તેની જવાબદારી મારી છે.",
  privacy: "ગોપનીયતા નીતિ",
  terms: "શરતો",
  create: "ગુપ્ત લિંક બનાવો",
  creating: "લૉક થઈ રહ્યું છે…",
  errEmptyText: "પહેલાં કંઈક લખો.",
  errEmptyDraw: "પહેલાં કંઈક દોરો.",
  errPhraseShort: "વાક્યમાં ઓછામાં ઓછા 4 અક્ષર રાખો.",
  errConsent: "આગળ વધવા બોક્સ પર ટિક કરો.",
  errTooLarge: "આ ચિત્ર મોકલવા માટે બહુ ભારે છે. થોડું ભૂંસીને ફરી પ્રયાસ કરો.",
  errNetwork: "સર્વર સુધી પહોંચી શકાયું નથી. કનેક્શન તપાસીને ફરી પ્રયાસ કરો.",
  errRate: "તમારા નેટવર્કથી ઘણા સંદેશ બન્યા. એક કલાક પછી ફરી પ્રયાસ કરો.",
  errGeneric: "કંઈક ગડબડ થઈ. ફરી પ્રયાસ કરો.",

  readyTitle: "તમારી લિંક તૈયાર છે",
  readyNote: "તે એક જ વાર કામ કરે છે. જે પહેલાં ખોલશે તે જ જોશે, એટલે જેના માટે છે તેને જ મોકલો.",
  readyPhrase: "ગુપ્ત વાક્ય આ લિંકથી અલગ, બીજી રીતે કહેવાનું ભૂલશો નહીં.",
  whatsapp: "WhatsApp પર મોકલો",
  copy: "લિંક કૉપી કરો",
  copied: "કૉપી થઈ ગયું",
  another: "બીજો બનાવો",
  shareText: "મારે તને એક વાત કહેવી છે. આ લિંક એક જ વાર ખૂલશે:",

  checking: "લિંક તપાસી રહ્યા છીએ…",
  goneTitle: "આ રહસ્ય હવે નથી.",
  goneBody: "તે પહેલાં જ ખોલાઈ ગયું છે, 7 દિવસમાં સમાપ્ત થઈ ગયું છે, અથવા લિંક સાચી નથી.",
  goneCta: "રહસ્ય મોકલો",
  incompleteTitle: "આ લિંક અધૂરી છે.",
  incompleteBody: "# પછીનો ભાગ ગાયબ છે. પૂરી લિંક ફરી માંગો.",
  waitingTitle: "તમારા માટે એક રહસ્ય રાહ જુએ છે",
  waitingBody:
    "તે એક જ વાર ખૂલે છે. ગાંઠ ખોલતાં જ તે અમારા સર્વરમાંથી ડિલીટ થઈ જાય છે. પછી પેજ છોડશો તો તે કાયમ માટે જતું રહેશે.",
  hintPrefix: "સંકેત",
  phraseEnter: "ગુપ્ત વાક્ય લખો",
  untie: "ગાંઠ ખોલો",
  untying: "ખૂલી રહ્યું છે…",
  errWrongPhrase: "આ વાક્યથી ખૂલ્યું નથી. ફરી પ્રયાસ કરો.",
  errBroken: "આ રહસ્ય ખૂલી શક્યું નથી. લિંક અધૂરી અથવા ખરાબ હોઈ શકે.",
  openedNote: "હવે તે અમારા સર્વરમાંથી ડિલીટ થઈ ગયું છે. પેજ છોડશો કે રીફ્રેશ કરશો તો જતું રહેશે.",
  sendBack: "એક પાછું મોકલો",

  footContact: "સંપર્ક",
  footNote: "શીખવા, શિક્ષણ અને મનોરંજન માટે.",
  langLabel: "ભાષા",
};

export const dictionaries: Record<Lang, typeof en> = { en, hi, gu };
export type Dict = typeof en;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "mnv-lang";

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi" || saved === "gu") return saved;
  } catch {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase();
  if (nav.startsWith("gu")) return "gu";
  if (nav.startsWith("hi")) return "hi";
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    // Language lives in localStorage, which the server can't read, so apply it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangState(detect());
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: dictionaries[lang] }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LangProvider");
  return ctx;
}

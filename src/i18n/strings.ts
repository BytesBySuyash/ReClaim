export type Language = "en" | "hi" | "te" | "ml" | "as" | "bn"

type Strings = {
  nav: { citizen: string; fieldworker: string; ngo: string; govt: string }
  lang: { title: string; sub: string; selectBtn: string }
  disaster: {
    title: string
    sub: string
    selectBtn: string
    affected: string
    day: string
  }
}

const languageStrings: Record<Language, Strings> = {
  en: {
    nav: {
      citizen: "Citizen / Victim",
      fieldworker: "Field Worker",
      ngo: "Organization",
      govt: "Government",
    },
    lang: {
      title: "Select Your Language",
      sub: "Choose the language you are most comfortable with",
      selectBtn: "Continue →",
    },
    disaster: {
      title: "Select Disaster",
      sub: "Choose the disaster event you need assistance with",
      selectBtn: "Continue →",
      affected: "households affected",
      day: "Day",
    },
  },
  hi: {
    nav: {
      citizen: "नागरिक / पीड़ित",
      fieldworker: "फील्ड वर्कर",
      ngo: "संस्था",
      govt: "सरकार",
    },
    lang: {
      title: "अपनी भाषा चुनें",
      sub: "वह भाषा चुनें जिसमें आप सहज हों",
      selectBtn: "आगे बढ़ें →",
    },
    disaster: {
      title: "आपदा चुनें",
      sub: "उस आपदा को चुनें जिसमें आपको सहायता चाहिए",
      selectBtn: "आगे बढ़ें →",
      affected: "घर प्रभावित",
      day: "दिन",
    },
  },
  te: {
    nav: {
      citizen: "పౌరుడు / బాధితుడు",
      fieldworker: "ఫీల్డ్ వర్కర్",
      ngo: "సంస్థ",
      govt: "ప్రభుత్వం",
    },
    lang: {
      title: "మీ భాషను ఎంచుకోండి",
      sub: "మీకు అనుకూలమైన భాషను ఎంచుకోండి",
      selectBtn: "కొనసాగించు →",
    },
    disaster: {
      title: "విపత్తును ఎంచుకోండి",
      sub: "మీకు సహాయం కావాల్సిన విపత్తును ఎంచుకోండి",
      selectBtn: "కొనసాగించు →",
      affected: "ప్రభావితమైన కుటుంబాలు",
      day: "రోజు",
    },
  },
  ml: {
    nav: {
      citizen: "പൗരൻ / ദുരിതബാധിതൻ",
      fieldworker: "ഫീൽഡ് വർക്കർ",
      ngo: "സംഘടന",
      govt: "സർക്കാർ",
    },
    lang: {
      title: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
      sub: "നിങ്ങൾക്ക് ഏറ്റവും സൗകര്യപ്രദമായ ഭാഷ തിരഞ്ഞെടുക്കുക",
      selectBtn: "തുടരുക →",
    },
    disaster: {
      title: "ദുരന്തം തിരഞ്ഞെടുക്കുക",
      sub: "നിങ്ങൾക്ക് സഹായം ആവശ്യമുള്ള ദുരന്തം തിരഞ്ഞെടുക്കുക",
      selectBtn: "തുടരുക →",
      affected: "ബാധിക്കപ്പെട്ട കുടുംബങ്ങൾ",
      day: "ദിവസം",
    },
  },
  as: {
    nav: {
      citizen: "নাগৰিক / ভুক্তভোগী",
      fieldworker: "ফিল্ড ৱৰ্কাৰ",
      ngo: "সংগঠন",
      govt: "চৰকাৰ",
    },
    lang: {
      title: "আপোনাৰ ভাষা বাছক",
      sub: "আপুনি আটাইতকৈ স্বাচ্ছন্দ্য অনুভৱ কৰা ভাষা বাছক",
      selectBtn: "আগবাঢ়ক →",
    },
    disaster: {
      title: "দুৰ্যোগ বাছক",
      sub: "আপুনি সহায় বিচৰা দুৰ্যোগটো বাছক",
      selectBtn: "আগবাঢ়ক →",
      affected: "প্ৰভাৱিত পৰিয়াল",
      day: "দিন",
    },
  },
  bn: {
    nav: {
      citizen: "নাগরিক / ভুক্তভোগী",
      fieldworker: "ফিল্ড ওয়ার্কার",
      ngo: "সংগঠন",
      govt: "সরকার",
    },
    lang: {
      title: "আপনার ভাষা বেছে নিন",
      sub: "আপনি যে ভাষায় স্বচ্ছন্দ, সেটি বেছে নিন",
      selectBtn: "এগিয়ে যান →",
    },
    disaster: {
      title: "দুর্যোগ নির্বাচন করুন",
      sub: "যে দুর্যোগে আপনার সহায়তা প্রয়োজন তা নির্বাচন করুন",
      selectBtn: "এগিয়ে যান →",
      affected: "প্রভাবিত পরিবার",
      day: "দিন",
    },
  },
}

export function getStrings(lang: string): Strings {
  return languageStrings[lang as Language] ?? languageStrings.en
}

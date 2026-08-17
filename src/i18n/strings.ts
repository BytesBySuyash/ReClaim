export type Language = "en" | "hi" | "te" | "ml" | "as" | "bn" | "mr" | "ta" | "gu" | "kn"

export type Strings = {
  nav: { citizen: string; fieldworker: string; ngo: string; govt: string }
  lang: { title: string; sub: string; selectBtn: string }
  disaster: {
    title: string
    sub: string
    selectBtn: string
    affected: string
    day: string
  }
  steps: {
    language: string
    story: string
    evidence: string
    aiAnalysis: string
    profile: string
    plan: string
    resources: string
  }
  report: {
    safe: string
    sub: string
    voice: string
    recording: string
    typeLabel: string
    placeholder: string
    dontKnow: string
    submit: string
  }
  evidence: {
    title: string
    sub: string
    photos: string
    videos: string
    bills: string
    docs: string
    photosHint: string
    videosHint: string
    billsHint: string
    docsHint: string
    privacy: string
    continue: string
    skip: string
    added: string
    tapToAdd: string
  }
  ai: {
    title: string
    complete: string
    sub: string
    asset: string
    evidence: string
    confidence: string
    priority: string
    totalLoss: string
    blockers: string
    assetsFound: string
    continue: string
  }
  hrvs: {
    title: string
    sub: string
    whyHigh: string
    depTitle: string
    depSub: string
    simTitle: string
    simSub: string
    projected: string
    continue: string
    aadhaarToggle: string
    sewingToggle: string
  }
  plan: {
    title: string
    sub: string
    h72: string
    d7: string
    d30: string
    d90: string
    survival: string
    stabilize: string
    recover: string
    rebuild: string
    current: string
    completed: string
    helpTitle: string
    helpSub: string
    helpBtn: string
  }
  resources: {
    title: string
    sub: string
    helplines: string
    schemes: string
    ngos: string
    docs: string
    call: string
    visit: string
    apply: string
  }
  sidebar: { report: string; offlineReady: string; encrypted: string }
  offline: { ready: string }
}

const en: Strings = {
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
  steps: {
    language: "Language",
    story: "Your Story",
    evidence: "Evidence",
    aiAnalysis: "AI Analysis",
    profile: "Your Profile",
    plan: "Recovery Plan",
    resources: "Help & Resources",
  },
  report: {
    safe: "You are safe. We are here to help.",
    sub: "Tell us what happened, in your own words. We will help you understand what support you can receive.",
    voice: "Tap to speak",
    recording: "Recording… speak naturally",
    typeLabel: "Or type your story:",
    placeholder:
      "Describe what happened — your house, belongings, documents, livelihood…",
    dontKnow: "I don't know",
    submit: "Continue →",
  },
  evidence: {
    title: "Upload Evidence",
    sub: "Upload photos, bills, or documents that show what was damaged or lost.",
    photos: "Damage Photos",
    videos: "Video Evidence",
    bills: "Bills & Receipts",
    docs: "Identity & Insurance Documents",
    photosHint: "Take photos of each damaged item separately",
    videosHint: "Short video of your home or shop helps verify claims",
    billsHint: "Bills prove the original value of lost items",
    docsHint: "Even a photo of the document on your phone helps",
    privacy:
      "Your information is private and encrypted. It will only be shared with verified relief organizations with your consent.",
    continue: "Submit & Analyse →",
    skip: "Upload Later",
    added: "Added",
    tapToAdd: "Tap to add",
  },
  ai: {
    title: "What RECLAIM found",
    complete: "AI Analysis Complete",
    sub: "Based on your voice report and uploaded evidence, our AI has identified the following assets and losses.",
    asset: "Asset",
    evidence: "Evidence",
    confidence: "AI Confidence",
    priority: "Priority",
    totalLoss: "Total estimated loss",
    blockers: "Critical blockers",
    assetsFound: "Assets identified",
    continue: "View Your Recovery Profile →",
  },
  hrvs: {
    title: "Your Recovery Profile",
    sub: "The Household Recovery Vulnerability Score (HRVS) measures how difficult recovery may be — not just how much was lost.",
    whyHigh: "Why is this score high? — Score Breakdown",
    depTitle: "Recovery Dependency Engine",
    depSub:
      "RECLAIM understands how one loss cascades into others — identifying which loss to fix first.",
    simTitle: "What-If Recovery Simulator",
    simSub: "Toggle interventions to see how your HRVS changes.",
    projected: "Projected HRVS after interventions",
    continue: "See Your Recovery Plan →",
    aadhaarToggle: "Aadhaar & identity documents replaced",
    sewingToggle: "Sewing machine replaced (livelihood restored)",
  },
  plan: {
    title: "Your Recovery Plan",
    sub: "Your recovery path, broken into achievable stages. Each phase builds on the previous one.",
    h72: "72 Hours",
    d7: "7 Days",
    d30: "30 Days",
    d90: "90 Days",
    survival: "Survival",
    stabilize: "Stabilization",
    recover: "Recovery",
    rebuild: "Rebuilding",
    current: "Current Phase",
    completed: "Completed",
    helpTitle: "Need help right now?",
    helpSub: "Request a field worker to visit your home",
    helpBtn: "Request Help",
  },
  resources: {
    title: "Help & Resources",
    sub: "Government helplines, schemes, and NGO contacts available to you.",
    helplines: "Emergency Helplines",
    schemes: "Government Schemes You May Qualify For",
    ngos: "NGO Support in Your Area",
    docs: "How to Replace Lost Documents",
    call: "Call",
    visit: "Visit",
    apply: "Apply Online",
  },
  sidebar: {
    report: "Recovery Report",
    offlineReady: "Offline ready",
    encrypted: "Data encrypted",
  },
  offline: { ready: "Offline mode ready" },
}

const hi: Strings = {
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
    affected: "घरों को प्रभावित",
    day: "दिन",
  },
  steps: {
    language: "भाषा",
    story: "आपकी कहानी",
    evidence: "सबूत",
    aiAnalysis: "AI विश्लेषण",
    profile: "आपकी प्रोफाइल",
    plan: "रिकवरी योजना",
    resources: "मदद और संसाधन",
  },
  report: {
    safe: "आप सुरक्षित हैं। हम मदद के लिए यहाँ हैं।",
    sub: "हमें बताएं क्या हुआ, अपने शब्दों में।",
    voice: "बोलने के लिए टैप करें",
    recording: "रिकॉर्डिंग हो रही है…",
    typeLabel: "या यहाँ लिखें:",
    placeholder: "बताइए क्या हुआ — घर, सामान, दस्तावेज़, काम…",
    dontKnow: "मुझे नहीं पता",
    submit: "आगे बढ़ें →",
  },
  evidence: {
    title: "सबूत अपलोड करें",
    sub: "फ़ोटो, बिल, या दस्तावेज़ अपलोड करें जो नुकसान दिखाते हों।",
    photos: "नुकसान की तस्वीरें",
    videos: "वीडियो सबूत",
    bills: "बिल और रसीदें",
    docs: "पहचान और बीमा दस्तावेज़",
    photosHint: "हर क्षतिग्रस्त वस्तु की अलग फोटो लें",
    videosHint: "घर या दुकान का वीडियो दावे को साबित करता है",
    billsHint: "बिल खोई वस्तुओं की असली कीमत साबित करते हैं",
    docsHint: "फोन पर दस्तावेज़ की फोटो भी काम आती है",
    privacy: "आपकी जानकारी निजी और एन्क्रिप्टेड है। केवल आपकी सहमति से साझा होगी।",
    continue: "जमा करें और विश्लेषण करें →",
    skip: "बाद में अपलोड करें",
    added: "जोड़ा गया",
    tapToAdd: "जोड़ने के लिए टैप करें",
  },
  ai: {
    title: "RECLAIM ने क्या पाया",
    complete: "AI विश्लेषण पूर्ण",
    sub: "आपकी आवाज़ की रिपोर्ट और अपलोड किए सबूतों के आधार पर हमारे AI ने निम्नलिखित की पहचान की।",
    asset: "संपत्ति",
    evidence: "सबूत",
    confidence: "AI विश्वास",
    priority: "प्राथमिकता",
    totalLoss: "कुल अनुमानित नुकसान",
    blockers: "गंभीर बाधाएं",
    assetsFound: "संपत्ति की पहचान",
    continue: "अपनी रिकवरी प्रोफाइल देखें →",
  },
  hrvs: {
    title: "आपकी रिकवरी प्रोफाइल",
    sub: "HRVS स्कोर दिखाता है कि रिकवरी कितनी मुश्किल हो सकती है।",
    whyHigh: "यह स्कोर ऊंचा क्यों है?",
    depTitle: "रिकवरी निर्भरता इंजन",
    depSub: "RECLAIM समझता है कि एक नुकसान दूसरे को कैसे प्रभावित करता है।",
    simTitle: "क्या-अगर सिम्युलेटर",
    simSub: "हस्तक्षेप चालू/बंद करके HRVS में बदलाव देखें।",
    projected: "हस्तक्षेप के बाद HRVS",
    continue: "रिकवरी योजना देखें →",
    aadhaarToggle: "आधार और पहचान दस्तावेज़ बदले गए",
    sewingToggle: "सिलाई मशीन बदली गई (आजीविका बहाल)",
  },
  plan: {
    title: "आपकी रिकवरी योजना",
    sub: "आपकी रिकवरी का रास्ता, चरणों में।",
    h72: "72 घंटे",
    d7: "7 दिन",
    d30: "30 दिन",
    d90: "90 दिन",
    survival: "जीवित रहना",
    stabilize: "स्थिरीकरण",
    recover: "रिकवरी",
    rebuild: "पुनर्निर्माण",
    current: "वर्तमान चरण",
    completed: "पूर्ण",
    helpTitle: "अभी मदद चाहिए?",
    helpSub: "फील्ड वर्कर को घर आने का अनुरोध करें",
    helpBtn: "मदद मांगें",
  },
  resources: {
    title: "मदद और संसाधन",
    sub: "सरकारी हेल्पलाइन, योजनाएं और NGO संपर्क।",
    helplines: "आपातकालीन हेल्पलाइन",
    schemes: "सरकारी योजनाएं जिनके आप पात्र हो सकते हैं",
    ngos: "आपके क्षेत्र में NGO सहायता",
    docs: "खोए दस्तावेज़ कैसे पाएं",
    call: "कॉल करें",
    visit: "जाएं",
    apply: "ऑनलाइन आवेदन",
  },
  sidebar: {
    report: "रिकवरी रिपोर्ट",
    offlineReady: "ऑफलाइन तैयार",
    encrypted: "डेटा एन्क्रिप्टेड",
  },
  offline: { ready: "ऑफलाइन मोड तैयार" },
}

const te: Strings = {
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
    title: "ఆపత్తు ఎంచుకోండి",
    sub: "మీకు సహాయం కావాల్సిన ఆపత్తు ఎంచుకోండి",
    selectBtn: "కొనసాగించు →",
    affected: "ఇళ్లను ప్రభావితం చేసింది",
    day: "దిన",
  },
  steps: {
    language: "భాష",
    story: "మీ కథ",
    evidence: "సాక్ష్యాలు",
    aiAnalysis: "AI విశ్లేషణ",
    profile: "మీ ప్రొఫైల్",
    plan: "రికవరీ ప్లాన్",
    resources: "సహాయం మరియు వనరులు",
  },
  report: {
    safe: "మీరు సురక్షితంగా ఉన్నారు. మేము సహాయానికి ఇక్కడ ఉన్నాం.",
    sub: "మీ సొంత మాటలలో ఏమి జరిగిందో చెప్పండి.",
    voice: "మాట్లాడటానికి నొక్కండి",
    recording: "రికార్డింగ్ అవుతోంది…",
    typeLabel: "లేదా ఇక్కడ టైప్ చేయండి:",
    placeholder: "ఏమి జరిగిందో వివరించండి — ఇల్లు, వస్తువులు, పత్రాలు…",
    dontKnow: "నాకు తెలియదు",
    submit: "కొనసాగించు →",
  },
  evidence: {
    title: "సాక్ష్యాలు అప్‌లోడ్ చేయండి",
    sub: "ఫోటోలు, బిల్లులు లేదా పత్రాలు అప్‌లోడ్ చేయండి.",
    photos: "నష్టం ఫోటోలు",
    videos: "వీడియో సాక్ష్యం",
    bills: "బిల్లులు మరియు రసీదులు",
    docs: "గుర్తింపు మరియు బీమా పత్రాలు",
    photosHint: "ప్రతి దెబ్బతిన్న వస్తువు యొక్క ఫోటో తీయండి",
    videosHint: "మీ ఇల్లు లేదా దుకాణం వీడియో క్లెయిమ్‌లను నిరూపిస్తుంది",
    billsHint: "బిల్లులు పోగొట్టుకున్న వస్తువుల విలువను నిరూపిస్తాయి",
    docsHint: "ఫోన్‌లో పత్రం ఫోటో కూడా సహాయపడుతుంది",
    privacy: "మీ సమాచారం గోప్యంగా మరియు గుప్తీకరించబడింది.",
    continue: "సమర్పించు మరియు విశ్లేషించు →",
    skip: "తర్వాత అప్‌లోడ్ చేయండి",
    added: "జోడించబడింది",
    tapToAdd: "జోడించడానికి నొక్కండి",
  },
  ai: {
    title: "RECLAIM కనుగొన్నది",
    complete: "AI విశ్లేషణ పూర్తయింది",
    sub: "మీ వాయిస్ రిపోర్ట్ మరియు అప్‌లోడ్ చేసిన సాక్ష్యాల ఆధారంగా AI గుర్తించింది.",
    asset: "ఆస్తి",
    evidence: "సాక్ష్యం",
    confidence: "AI నమ్మకం",
    priority: "ప్రాధాన్యత",
    totalLoss: "మొత్తం అంచనా నష్టం",
    blockers: "క్లిష్టమైన అడ్డంకులు",
    assetsFound: "గుర్తించిన ఆస్తులు",
    continue: "మీ రికవరీ ప్రొఫైల్ చూడండి →",
  },
  hrvs: {
    title: "మీ రికవరీ ప్రొఫైల్",
    sub: "HRVS స్కోర్ రికవరీ ఎంత కష్టంగా ఉంటుందో చూపిస్తుంది.",
    whyHigh: "ఈ స్కోర్ ఎందుకు ఎక్కువగా ఉంది?",
    depTitle: "రికవరీ డిపెండెన్సీ ఇంజిన్",
    depSub: "RECLAIM ఒక నష్టం మరొకదానిని ఎలా ప్రభావితం చేస్తుందో అర్థం చేసుకుంటుంది.",
    simTitle: "వాట్-ఇఫ్ సిమ్యులేటర్",
    simSub: "జోక్యాలు టోగుల్ చేసి HRVS మార్పు చూడండి.",
    projected: "జోక్యాల తర్వాత HRVS",
    continue: "మీ రికవరీ ప్లాన్ చూడండి →",
    aadhaarToggle: "ఆధార్ మరియు గుర్తింపు పత్రాలు భర్తీ చేయబడ్డాయి",
    sewingToggle: "కుట్టు మిషన్ భర్తీ చేయబడింది (జీవనోపాధి పునరుద్ధరణ)",
  },
  plan: {
    title: "మీ రికవరీ ప్లాన్",
    sub: "మీ రికవరీ మార్గం, సాధించదగిన దశలలో.",
    h72: "72 గంటలు",
    d7: "7 రోజులు",
    d30: "30 రోజులు",
    d90: "90 రోజులు",
    survival: "మనుగడ",
    stabilize: "స్థిరీకరణ",
    recover: "రికవరీ",
    rebuild: "పునర్నిర్మాణం",
    current: "ప్రస్తుత దశ",
    completed: "పూర్తయింది",
    helpTitle: "ఇప్పుడు సహాయం కావాలా?",
    helpSub: "ఫీల్డ్ వర్కర్‌ని ఇంటికి పంపించమని అభ్యర్థించండి",
    helpBtn: "సహాయం కోరండి",
  },
  resources: {
    title: "సహాయం మరియు వనరులు",
    sub: "ప్రభుత్వ హెల్ప్‌లైన్లు, పథకాలు మరియు NGO సంప్రదింపులు.",
    helplines: "అత్యవసర హెల్ప్‌లైన్లు",
    schemes: "మీకు అర్హమైన ప్రభుత్వ పథకాలు",
    ngos: "మీ ప్రాంతంలో NGO సహాయం",
    docs: "పోగొట్టుకున్న పత్రాలు ఎలా పొందాలి",
    call: "కాల్ చేయండి",
    visit: "సందర్శించండి",
    apply: "ఆన్‌లైన్ దరఖాస్తు",
  },
  sidebar: {
    report: "రికవరీ రిపోర్ట్",
    offlineReady: "ఆఫ్‌లైన్ సిద్ధం",
    encrypted: "డేటా గుప్తీకరించబడింది",
  },
  offline: { ready: "ఆఫ్‌లైన్ మోడ్ సిద్ధం" },
}

const ml: Strings = {
  nav: {
    citizen: "പൗരൻ / ഇര",
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
    title: "പദ്ധതി തിരഞ്ഞെടുക്കുക",
    sub: "നിങ്ങൾക്ക് സഹായം ആവശ്യമായ ദുരന്തം തിരഞ്ഞെടുക്കുക",
    selectBtn: "തുടരുക →",
    affected: "വീടുകളെ ബാധിച്ചു",
    day: "ദിന",
  },
  steps: {
    language: "ഭാഷ",
    story: "നിങ്ങളുടെ കഥ",
    evidence: "തെളിവ്",
    aiAnalysis: "AI വിശ്ലേഷണം",
    profile: "നിങ്ങളുടെ പ്രൊഫൈൽ",
    plan: "വീണ്ടെടുക്കൽ പദ്ധതി",
    resources: "സഹായം & വിഭവങ്ങൾ",
  },
  report: {
    safe: "നിങ്ങൾ സുരക്ഷിതരാണ്. ഞങ്ങൾ സഹായിക്കാൻ ഇവിടെ ഉണ്ട്.",
    sub: "നിങ്ങളുടെ സ്വന്തം വാക്കുകളിൽ എന്ത് സംഭവിച്ചു എന്ന് പറയൂ.",
    voice: "സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക",
    recording: "റെക്കോർഡ് ചെയ്യുന്നു…",
    typeLabel: "അല്ലെങ്കിൽ ഇവിടെ ടൈപ്പ് ചെയ്യുക:",
    placeholder: "എന്ത് സംഭവിച്ചു — വീട്, സ്വത്ത്, രേഖകൾ…",
    dontKnow: "എനിക്ക് അറിയില്ല",
    submit: "തുടരുക →",
  },
  evidence: {
    title: "തെളിവ് അപ്‌ലോഡ് ചെയ്യുക",
    sub: "ഫോട്ടോകൾ, ബില്ലുകൾ അല്ലെങ്കിൽ രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക.",
    photos: "നാശ ഫോട്ടോകൾ",
    videos: "വീഡിയോ തെളിവ്",
    bills: "ബില്ലുകളും രസീതുകളും",
    docs: "ഐഡി & ഇൻഷുറൻസ് രേഖകൾ",
    photosHint: "ഓരോ കേടായ വസ്തുവിന്റെ ഫോട്ടോ എടുക്കുക",
    videosHint: "വീടിന്റെ ഹ്രസ്വ വീഡിയോ ക്ലെയിം തെളിയിക്കും",
    billsHint: "ബില്ലുകൾ നഷ്‌ടപ്പെട്ട സ്വത്തിന്റെ മൂല്യം തെളിയിക്കുന്നു",
    docsHint: "ഫോണിൽ രേഖയുടെ ഫോട്ടോ പോലും സഹായിക്കും",
    privacy: "നിങ്ങളുടെ വിവരങ്ങൾ സ്വകാര്യവും എൻക്രിപ്റ്റ് ചെയ്തതുമാണ്.",
    continue: "സമർപ്പിച്ച് വിശ്ലേഷിക്കുക →",
    skip: "പിന്നീട് അപ്‌ലോഡ് ചെയ്യുക",
    added: "ചേർത്തു",
    tapToAdd: "ചേർക്കാൻ ടാപ്പ് ചെയ്യുക",
  },
  ai: {
    title: "RECLAIM കണ്ടെത്തിയത്",
    complete: "AI വിശ്ലേഷണം പൂർത്തിയായി",
    sub: "നിങ്ങളുടെ ശബ്ദ റിപ്പോർട്ടും അപ്‌ലോഡ് ചെയ്ത തെളിവുകളും അടിസ്ഥാനമാക്കി AI തിരിച്ചറിഞ്ഞത്.",
    asset: "ആസ്തി",
    evidence: "തെളിവ്",
    confidence: "AI ആത്മവിശ്വാസം",
    priority: "മുൻഗണന",
    totalLoss: "ആകെ കണക്കാക്കിയ നഷ്‌ടം",
    blockers: "നിർണ്ണായക തടസ്സങ്ങൾ",
    assetsFound: "തിരിച്ചറിഞ്ഞ ആസ്തികൾ",
    continue: "നിങ്ങളുടെ വീണ്ടെടുക്കൽ പ്രൊഫൈൽ കാണുക →",
  },
  hrvs: {
    title: "നിങ്ങളുടെ വീണ്ടെടുക്കൽ പ്രൊഫൈൽ",
    sub: "HRVS സ്‌കോർ വീണ്ടെടുക്കൽ എത്ര ബുദ്ധിമുട്ടാകുമെന്ന് അളക്കുന്നു.",
    whyHigh: "ഈ സ്‌കോർ ഉയർന്നത് എന്തുകൊണ്ട്?",
    depTitle: "വീണ്ടെടുക്കൽ ആശ്രിതത്വ എഞ്ചിൻ",
    depSub: "ഒരു നഷ്‌ടം മറ്റൊന്നിനെ എങ്ങനെ ബാധിക്കുന്നു എന്ന് RECLAIM മനസ്സിലാക്കുന്നു.",
    simTitle: "വാട്ട്-ഇഫ് സിമ്മുലേറ്റർ",
    simSub: "ഇടപെടലുകൾ ടോഗിൾ ചെയ്ത് HRVS മാറ്റം കാണുക.",
    projected: "ഇടപെടലുകൾക്ക് ശേഷം HRVS",
    continue: "നിങ്ങളുടെ വീണ്ടെടുക്കൽ പദ്ധതി കാണുക →",
    aadhaarToggle: "ആധാർ & ഐഡി രേഖകൾ പ്രതിസ്ഥാപിച്ചു",
    sewingToggle: "തുന്നൽ മെഷീൻ പ്രതിസ്ഥാപിച്ചു (ഉപജീവനം പുനഃസ്ഥാപിച്ചു)",
  },
  plan: {
    title: "നിങ്ങളുടെ വീണ്ടെടുക്കൽ പദ്ധതി",
    sub: "ഘട്ടങ്ങളിലൂടെ നിങ്ങളുടെ വീണ്ടെടുക്കൽ പാത.",
    h72: "72 മണിക്കൂർ",
    d7: "7 ദിവസം",
    d30: "30 ദിവസം",
    d90: "90 ദിവസം",
    survival: "അതിജീവനം",
    stabilize: "സ്ഥിരീകരണം",
    recover: "വീണ്ടെടുക്കൽ",
    rebuild: "പുനർനിർമ്മാണം",
    current: "നിലവിലെ ഘട്ടം",
    completed: "പൂർത്തിയായി",
    helpTitle: "ഇപ്പോൾ സഹായം വേണോ?",
    helpSub: "ഒരു ഫീൽഡ് വർക്കറെ വീട്ടിൽ അയക്കാൻ അഭ്യർഥിക്കുക",
    helpBtn: "സഹായം അഭ്യർഥിക്കുക",
  },
  resources: {
    title: "സഹായം & വിഭവങ്ങൾ",
    sub: "ഗവൺമെന്റ് ഹെൽപ്‌ലൈനുകൾ, പദ്ധതികൾ, NGO ബന്ധങ്ങൾ.",
    helplines: "അടിയന്തിര ഹെൽപ്‌ലൈനുകൾ",
    schemes: "നിങ്ങൾക്ക് അർഹമായ ഗവൺമെന്റ് പദ്ധതികൾ",
    ngos: "നിങ്ങളുടെ പ്രദേശത്ത് NGO സഹായം",
    docs: "നഷ്‌ടപ്പെട്ട രേഖകൾ എങ്ങനെ നേടാം",
    call: "വിളിക്കുക",
    visit: "സന്ദർശിക്കുക",
    apply: "ഓൺലൈൻ അപേക്ഷ",
  },
  sidebar: {
    report: "വീണ്ടെടുക്കൽ റിപ്പോർട്ട്",
    offlineReady: "ഓഫ്‌ലൈൻ തയ്യാർ",
    encrypted: "ഡേറ്റ എൻക്രിപ്റ്റ് ചെയ്തു",
  },
  offline: { ready: "ഓഫ്‌ലൈൻ മോഡ് തയ്യാർ" },
}

const as: Strings = {
  nav: {
    citizen: "নাগৰিক / ভুক্তভোগী",
    fieldworker: "ফিল্ড ৱৰ্কাৰ",
    ngo: "সংগঠন",
    govt: "চৰকাৰ",
  },
  lang: {
    title: "আপোনাৰ ভাষা বাছক",
    sub: "আপুনি সবচেয়ে স্বাচ্ছন্দ্য অনুভৱ কৰা ভাষা বাছক",
    selectBtn: "আগবাঢ়ক →",
  },
  disaster: {
    title: "দুৰন্ত বাছক",
    sub: "আপুনি সহায় পাব লাগা দুৰন্ত বাছক",
    selectBtn: "আগবাঢ়ক →",
    affected: "ঘৰক প্রভাৱিত কৰিছে",
    day: "দিন",
  },
  steps: {
    language: "ভাষা",
    story: "আপোনাৰ কাহিনী",
    evidence: "প্ৰমাণ",
    aiAnalysis: "AI বিশ্লেষণ",
    profile: "আপোনাৰ প্ৰফাইল",
    plan: "পুনৰুদ্ধাৰ পৰিকল্পনা",
    resources: "সহায় আৰু সম্পদ",
  },
  report: {
    safe: "আপুনি সুৰক্ষিত। আমি সহায় কৰিবলৈ ইয়াত আছোঁ।",
    sub: "আপোনাৰ নিজা কথাত কি হৈছিল কওক।",
    voice: "কথা পাতিবলৈ টেপ কৰক",
    recording: "ৰেকৰ্ড হৈ আছে…",
    typeLabel: "অথবা ইয়াত টাইপ কৰক:",
    placeholder: "কি হৈছিল বৰ্ণনা কৰক — ঘৰ, সম্পত্তি, নথি…",
    dontKnow: "মই নাজানো",
    submit: "আগবাঢ়ক →",
  },
  evidence: {
    title: "প্ৰমাণ আপলোড কৰক",
    sub: "ক্ষতি দেখুওৱা ফটো, বিল বা নথি আপলোড কৰক।",
    photos: "ক্ষতিৰ ফটো",
    videos: "ভিডিঅ প্ৰমাণ",
    bills: "বিল আৰু ৰচিদ",
    docs: "পৰিচয় আৰু বীমা নথি",
    photosHint: "প্ৰতিটো ক্ষতিগ্ৰস্ত বস্তুৰ ফটো তুলক",
    videosHint: "ঘৰ বা দোকানৰ চুটি ভিডিঅ দাবী প্ৰমাণ কৰে",
    billsHint: "বিলবোৰে হেৰুওৱা বস্তুবোৰৰ মূল্য প্ৰমাণ কৰে",
    docsHint: "ফোনত নথিৰ ফটোও সহায় কৰে",
    privacy: "আপোনাৰ তথ্য গোপনীয় আৰু এনক্ৰিপ্টেড।",
    continue: "জমা দিয়ক আৰু বিশ্লেষণ কৰক →",
    skip: "পিছত আপলোড কৰক",
    added: "যোগ কৰা হৈছে",
    tapToAdd: "যোগ কৰিবলৈ টেপ কৰক",
  },
  ai: {
    title: "RECLAIM-এ কি বিচাৰি পালে",
    complete: "AI বিশ্লেষণ সম্পূৰ্ণ",
    sub: "আপোনাৰ ভয়েছ ৰিপোৰ্ট আৰু আপলোড কৰা প্ৰমাণৰ আধাৰত AI-এ চিনাক্ত কৰিলে।",
    asset: "সম্পত্তি",
    evidence: "প্ৰমাণ",
    confidence: "AI বিশ্বাস",
    priority: "অগ্ৰাধিকাৰ",
    totalLoss: "মুঠ আনুমানিক ক্ষতি",
    blockers: "জটিল বাধা",
    assetsFound: "চিনাক্ত সম্পত্তি",
    continue: "আপোনাৰ পুনৰুদ্ধাৰ প্ৰফাইল চাওক →",
  },
  hrvs: {
    title: "আপোনাৰ পুনৰুদ্ধাৰ প্ৰফাইল",
    sub: "HRVS স্কোৰে পুনৰুদ্ধাৰ কিমান কঠিন হ'ব পাৰে সেয়া জুখে।",
    whyHigh: "এই স্কোৰ বেছি কিয়?",
    depTitle: "পুনৰুদ্ধাৰ নিৰ্ভৰশীলতা ইঞ্জিন",
    depSub: "এটা ক্ষতিয়ে আনটোক কেনেকৈ প্ৰভাৱিত কৰে RECLAIM-এ বুজে।",
    simTitle: "হ'লে-কি চিমুলেটৰ",
    simSub: "হস্তক্ষেপ চালু/বন্ধ কৰি HRVS পৰিৱৰ্তন চাওক।",
    projected: "হস্তক্ষেপৰ পিছত HRVS",
    continue: "আপোনাৰ পুনৰুদ্ধাৰ পৰিকল্পনা চাওক →",
    aadhaarToggle: "আধাৰ আৰু পৰিচয় নথি সলনি কৰা হ'ল",
    sewingToggle: "চিলাই মেচিন সলনি কৰা হ'ল (জীৱিকা পুনৰুদ্ধাৰ)",
  },
  plan: {
    title: "আপোনাৰ পুনৰুদ্ধাৰ পৰিকল্পনা",
    sub: "পদক্ষেপত আপোনাৰ পুনৰুদ্ধাৰৰ পথ।",
    h72: "৭২ ঘণ্টা",
    d7: "৭ দিন",
    d30: "৩০ দিন",
    d90: "৯০ দিন",
    survival: "বাঁচি থকা",
    stabilize: "স্থিতিশীলতা",
    recover: "পুনৰুদ্ধাৰ",
    rebuild: "পুনৰ্নিৰ্মাণ",
    current: "বৰ্তমান পদক্ষেপ",
    completed: "সম্পূৰ্ণ",
    helpTitle: "এতিয়াই সহায় লাগেনে?",
    helpSub: "এজন ফিল্ড ৱৰ্কাৰক ঘৰলৈ আহিবলৈ অনুৰোধ কৰক",
    helpBtn: "সহায় বিচাৰক",
  },
  resources: {
    title: "সহায় আৰু সম্পদ",
    sub: "চৰকাৰী হেল্পলাইন, আঁচনি আৰু NGO যোগাযোগ।",
    helplines: "জৰুৰীকালীন হেল্পলাইন",
    schemes: "আপুনি যোগ্য হ'ব পৰা চৰকাৰী আঁচনি",
    ngos: "আপোনাৰ এলেকাত NGO সহায়",
    docs: "হেৰুওৱা নথি কেনেকৈ পাব",
    call: "ফোন কৰক",
    visit: "যাওক",
    apply: "অনলাইন আবেদন",
  },
  sidebar: {
    report: "পুনৰুদ্ধাৰ ৰিপোৰ্ট",
    offlineReady: "অফলাইন সক্ষম",
    encrypted: "ডেটা এনক্ৰিপ্টেড",
  },
  offline: { ready: "অফলাইন মোড সক্ষম" },
}

const bn: Strings = {
  nav: {
    citizen: "নাগরিক / ভুক্তভোগী",
    fieldworker: "ফিল্ড ওয়ার্কার",
    ngo: "সংগঠন",
    govt: "সরকার",
  },
  lang: {
    title: "আপনার ভাষা বেছে নিন",
    sub: "আপনি সবচেয়ে স্বাচ্ছন্দ্য বোধ করেন এমন ভাষা বেছে নিন",
    selectBtn: "এগিয়ে যান →",
  },
  disaster: {
    title: "দুর্যোগ নির্বাচন করুন",
    sub: "যে দুর্যোগে আপনার সহায়তা প্রয়োজন তা নির্বাচন করুন",
    selectBtn: "এগিয়ে যান →",
    affected: "পরিবার প্রভাবিত",
    day: "দিন",
  },
  steps: {
    language: "ভাষা",
    story: "আপনার গল্প",
    evidence: "প্রমাণ",
    aiAnalysis: "AI বিশ্লেষণ",
    profile: "আপনার প্রোফাইল",
    plan: "পুনরুদ্ধার পরিকল্পনা",
    resources: "সহায়তা ও সম্পদ",
  },
  report: {
    safe: "আপনি নিরাপদ। আমরা সাহায্য করতে এখানে আছি।",
    sub: "আমাদের বলুন কি হয়েছে, আপনার নিজের কথায়।",
    voice: "কথা বলতে ট্যাপ করুন",
    recording: "রেকর্ড হচ্ছে…",
    typeLabel: "বা এখানে টাইপ করুন:",
    placeholder: "কি হয়েছে বলুন — বাড়ি, জিনিসপত্র, কাগজপত্র…",
    dontKnow: "আমি জানি না",
    submit: "এগিয়ে যান →",
  },
  evidence: {
    title: "প্রমাণ আপলোড করুন",
    sub: "ক্ষতি দেখানো ছবি, বিল বা নথি আপলোড করুন।",
    photos: "ক্ষতির ছবি",
    videos: "ভিডিও প্রমাণ",
    bills: "বিল ও রসিদ",
    docs: "পরিচয় ও বিমা নথি",
    photosHint: "প্রতিটি ক্ষতিগ্রস্ত জিনিসের আলাদা ছবি তুলুন",
    videosHint: "বাড়ির ছোট ভিডিও দাবি প্রমাণ করে",
    billsHint: "বিল হারানো জিনিসের মূল্য প্রমাণ করে",
    docsHint: "ফোনে নথির ছবিও সাহায্য করে",
    privacy: "আপনার তথ্য ব্যক্তিগত এবং এনক্রিপ্টেড।",
    continue: "জমা দিন ও বিশ্লেষণ করুন →",
    skip: "পরে আপলোড করুন",
    added: "যোগ করা হয়েছে",
    tapToAdd: "যোগ করতে ট্যাপ করুন",
  },
  ai: {
    title: "RECLAIM যা খুঁজে পেয়েছে",
    complete: "AI বিশ্লেষণ সম্পন্ন",
    sub: "আপনার ভয়েস রিপোর্ট এবং আপলোড করা প্রমাণের ভিত্তিতে AI চিহ্নিত করেছে।",
    asset: "সম্পদ",
    evidence: "প্রমাণ",
    confidence: "AI আস্থা",
    priority: "অগ্রাধিকার",
    totalLoss: "মোট আনুমানিক ক্ষতি",
    blockers: "জটিল বাধা",
    assetsFound: "চিহ্নিত সম্পদ",
    continue: "আপনার পুনরুদ্ধার প্রোফাইল দেখুন →",
  },
  hrvs: {
    title: "আপনার পুনরুদ্ধার প্রোফাইল",
    sub: "HRVS স্কোর পুনরুদ্ধার কতটা কঠিন হতে পারে তা পরিমাপ করে।",
    whyHigh: "এই স্কোর কেন বেশি?",
    depTitle: "পুনরুদ্ধার নির্ভরতা ইঞ্জিন",
    depSub: "একটি ক্ষতি অন্যটিকে কীভাবে প্রভাবিত করে RECLAIM বোঝে।",
    simTitle: "যদি-কি সিমুলেটর",
    simSub: "হস্তক্ষেপ চালু/বন্ধ করে HRVS পরিবর্তন দেখুন।",
    projected: "হস্তক্ষেপের পর HRVS",
    continue: "আপনার পুনরুদ্ধার পরিকল্পনা দেখুন →",
    aadhaarToggle: "আধার ও পরিচয় নথি প্রতিস্থাপিত",
    sewingToggle: "সেলাই মেশিন প্রতিস্থাপিত (জীবিকা পুনরুদ্ধার)",
  },
  plan: {
    title: "আপনার পুনরুদ্ধার পরিকল্পনা",
    sub: "পর্যায়ে আপনার পুনরুদ্ধারের পথ।",
    h72: "৭২ ঘণ্টা",
    d7: "৭ দিন",
    d30: "৩০ দিন",
    d90: "৯০ দিন",
    survival: "বেঁচে থাকা",
    stabilize: "স্থিতিশীলতা",
    recover: "পুনরুদ্ধার",
    rebuild: "পুনর্নির্মাণ",
    current: "বর্তমান পর্যায়",
    completed: "সম্পন্ন",
    helpTitle: "এখনই সাহায্য দরকার?",
    helpSub: "একজন ফিল্ড ওয়ার্কারকে বাড়িতে আসতে অনুরোধ করুন",
    helpBtn: "সাহায্য চান",
  },
  resources: {
    title: "সহায়তা ও সম্পদ",
    sub: "সরকারি হেল্পলাইন, প্রকল্প এবং NGO যোগাযোগ।",
    helplines: "জরুরি হেল্পলাইন",
    schemes: "আপনি যোগ্য হতে পারেন এমন সরকারি প্রকল্প",
    ngos: "আপনার এলাকায় NGO সহায়তা",
    docs: "হারানো নথি কীভাবে পাবেন",
    call: "কল করুন",
    visit: "যান",
    apply: "অনলাইনে আবেদন",
  },
  sidebar: {
    report: "পুনরুদ্ধার রিপোর্ট",
    offlineReady: "অফলাইন প্রস্তুত",
    encrypted: "ডেটা এনক্রিপ্টেড",
  },
  offline: { ready: "অফলাইন মোড প্রস্তুত" },
}

export const LANGUAGE_STRINGS: Record<Language, Strings> = {
  en,
  hi,
  te,
  ml,
  as: as,
  bn,
}

export function getStrings(lang: Language): Strings {
  return LANGUAGE_STRINGS[lang] ?? LANGUAGE_STRINGS["en"]
}

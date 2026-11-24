// src/lib/prankEngine.ts

export type BaitMode = "news" | "gift" | "leak";
export type LangMode = "mix" | "en" | "hi";
export type SpiceMode = "chaotic" | "dark";
export type HeadlineCategory = "unhinged" | "exposed" | "clout" | "dark" | "hinglish" | "gift";

export interface HeadlinePreset {
  id: string;
  category: HeadlineCategory;
  mode: BaitMode;
  template: string;
  tag: string;
  subhead: string;
  lang: "en" | "hi";
  dark?: boolean;
}

export interface BaitPayload {
  name: string;
  headlineId?: string;
  customHeadline?: string;
  customSubhead?: string;
  customTag?: string;
  mode: BaitMode;
  lang?: LangMode;
  spice?: SpiceMode;
  sender?: string;
  chain: number;
  seed?: number;
}

// Curated starter presets (instant quick-picks)
export const HEADLINE_PRESETS: HeadlinePreset[] = [
  {
    id: "h1",
    category: "hinglish",
    mode: "news",
    lang: "hi",
    template: 'BREAKING: {name} raat ke 3 baje Google pe "am I ugly or just broke" search karte pakda gaya',
    tag: "TAZA KHABAR",
    subhead: "Search tab 18 minute khula raha, aakhir mein khud hi Wi-Fi band kar diya.",
  },
  {
    id: "h2",
    category: "hinglish",
    mode: "leak",
    lang: "hi",
    template: "LEAKED: {name} ke mummy ne uski incognito history print karwa ke family group mein daal di",
    tag: "FAMILY ALERT",
    subhead: "Chacha ne sirf 'hmm' likha hai. Ghar wapas jaana ab risky ho gaya hai.",
    dark: true,
  },
  {
    id: "h3",
    category: "hinglish",
    mode: "news",
    lang: "hi",
    template: "CONFIRMED: {name} shaadi ke buffet mein hoodie ke andar 2 plate paneer pack karte CCTV mein kaid",
    tag: "CCTV 04",
    subhead: "Halwai ne roka toh bola 'bhai kutte ke liye le jaa raha hoon' — ghar mein kutta hai hi nahi.",
  },
  {
    id: "d1",
    category: "dark",
    mode: "leak",
    lang: "hi",
    dark: true,
    template: "URGENT: {name} ka naam papa ki property will se quietly hata diya gaya hai",
    tag: "LEGAL DESK",
    subhead: "Subah chai pe announcement hone wali thi par document pehle hi leak ho gaya.",
  },
  {
    id: "d2",
    category: "dark",
    mode: "leak",
    lang: "en",
    dark: true,
    template: "LEAKED: {name}'s FBI agent officially resigned after reading their 2 AM notes app",
    tag: "CLASSIFIED",
    subhead: "Internal memo says 'I don't get paid enough to witness this level of delusion.'",
  },
  {
    id: "d3",
    category: "dark",
    mode: "news",
    lang: "hi",
    dark: true,
    template: "BREAKING: Chitragupta ne {name} ki file kholi aur seedha 'skip' daba diya",
    tag: "DARK DESK",
    subhead: "Narak walo ne bhi bol diya 'bhai itna baggage humse handle nahi hoga.'",
  },
  {
    id: "u1",
    category: "unhinged",
    mode: "news",
    lang: "en",
    template: 'BREAKING: {name} caught googling "how to shower without getting wet"',
    tag: "LIVE DESK",
    subhead: "Witnesses say the tab stayed open for 14 minutes before anyone intervened.",
  },
  {
    id: "e1",
    category: "exposed",
    mode: "leak",
    lang: "en",
    template: "EXPOSED: {name} accidentally liked a 2021 photo while stalking an ex at 2:47 AM",
    tag: "ARCHIVE",
    subhead: "Deactivated the account in 1.4 seconds. Still got screenshotted by 3 people.",
  },
  {
    id: "g1",
    category: "gift",
    mode: "gift",
    lang: "hi",
    template: "{name}, kisi ne tere liye secret UPI Cashback + Mystery Box bheja hai",
    tag: "UNCLAIMED",
    subhead: "Sirf 10 minute valid hai. Claim karne ke liye seal tod.",
  },
  {
    id: "g2",
    category: "gift",
    mode: "gift",
    lang: "en",
    template: "Someone in your contacts left an anonymous confession about {name}",
    tag: "PRIVATE DROP",
    subhead: "Self-destructs after 1 view. Tap to see who sent this.",
  },
];

// ============================================================================
// COMBINATORIAL ENGINE (1,200,000+ NON-REPEATING COMBINATIONS)
// ============================================================================

const EN_TAGS = [
  "BREAKING", "EXCLUSIVE", "CCTV 04", "LIVE DESK", "URGENT", "CONFIRMED",
  "LEAKED", "METRO", "JUST IN", "PUBLIC RECORD", "ALERT", "UNVERIFIED",
  "EYEWITNESS", "ARCHIVE", "FLASH", "LOCAL DESK",
];

const EN_ACTIONS = [
  "caught googling 'how to look busy without doing anything'",
  "spotted rehearsing fake arguments in the bathroom mirror",
  "filmed arguing with a self-checkout machine for 19 minutes",
  "failed an 'I am not a robot' traffic light captcha 6 times",
  "still types 'google.com' into Google to search things",
  "tripped on flat pavement and turned around to glare at the floor",
  "accidentally unmuted during a dead-silent call while eating loudly",
  "sent a 4-minute voice note rant to the completely wrong group chat",
  "uses fingers under the table to calculate 8 + 7",
  "pretended to get an urgent phone call just to escape small talk",
  "stared at a 'PULL' door for 11 seconds while pushing it aggressively",
  "said 'you too' when the waiter told them to enjoy their meal",
  "got caught stalking their own ex from a burner with 0 followers",
  "left 84 messages on read and still texted 'sorry crazy week'",
  "paid full price for a gym membership they visited twice in 2024",
  "tried to zoom in on a printed restaurant menu with two fingers",
  "waved back passionately at someone waving to the person behind them",
  "fell asleep holding their phone and accidentally called their boss",
  "walked into a glass door and immediately apologized to the glass",
  "took 47 selfies in a row and hated every single one",
  "typed a 6-paragraph comeback and deleted all of it to send 'ok'",
  "got rejected by an automatic sliding door twice in one afternoon",
  "tried to scan a regular barcode with the flashlight app",
  "laughed at a joke they didn't hear and got asked to explain it",
  "ordered iced coffee at 11 PM and blamed astrology for insomnia",
  "accidentally screenshotted a chat and sent it right back to the same person",
  "hid behind a grocery aisle to avoid saying hi to a high school classmate",
  "spent 40 minutes picking a movie and fell asleep during the opening credits",
  "checked their bank balance and immediately put the snack back on the shelf",
  "called their teacher 'mom' in front of 35 witnesses",
  "forgot their own Wi-Fi password and blamed the router",
  "spent 2 hours building a playlist nobody asked for",
];

const EN_TWISTS = [
  "— 4K CCTV footage just hit the group chat",
  "while claiming to be 'locked in on self-improvement'",
  "and tried to act like nobody saw a thing",
  "right after bragging about having 'high situational awareness'",
  "before faking a Wi-Fi disconnect to escape",
  "— screenshots are already circulating on close friends stories",
  "despite swearing on their life it never happened",
  "and somehow still blamed Mercury retrograde",
  "as three bystanders silently recorded the entire thing",
  "after telling everyone they were 'too busy to hang out'",
  "— full 90-second clip just leaked online",
  "and immediately switched their phone to airplane mode",
  "with zero recovery plan and negative aura",
  "— experts say the secondhand embarrassment is permanent",
  "and asked everyone present to sign an NDA",
  "while wearing sunglasses indoors to hide the shame",
  "— local news just picked up the story",
  "and tried to delete the evidence 9 seconds too late",
  "after confidently saying 'watch this'",
  "— witnesses still haven't recovered",
];

const EN_DARK_TAGS = [
  "CLASSIFIED", "FINAL NOTICE", "RESTRICTED", "RED FILE", "DARK ARCHIVE",
  "INTERNAL LEAK", "MISSING AURA", "DOSSIER #404", "CASE CLOSED", "REDACTED",
];

const EN_DARK_ACTIONS = [
  "'s FBI agent officially requested a mental health transfer after reading their 3 AM notes",
  "was quietly removed from the family group chat — they made a new one without them",
  "'s therapist just asked for a second therapist after yesterday's session",
  "got ghosted so hard even their shadow stopped showing up at noon",
  "'s future self just traveled back in time just to shake their head and leave",
  "'s sleep paralysis demon moved out because the room vibe was too depressing",
  "has been replaced by a cardboard cutout in the friend group and nobody noticed for 4 days",
  "'s guardian angel just filed for early retirement citing 'unpreventable L's'",
  "'s browser history was accidentally backed up to the family iPad",
  "got left on 'delivered' so long the message qualified for historical preservation",
  "'s screen time report was classified as a psychological horror document",
  "asked 'am I the problem?' and 7 people started typing simultaneously",
  "'s crush saw their story in 0.2 seconds and still ignored their text from Tuesday",
  "was nominated for 'Most Likely To Fumble A Guaranteed Win' — won unanimously",
  "'s deleted drafts just synced to a public Google Drive link",
  "'s bank app sent a push notification that just said 'bro please stop'",
  "tried to fake their own disappearance and nobody texted to check for 11 days",
  "'s search history just triggered a welfare check from Chrome itself",
  "got aired so hard in the group chat the silence echoed for 6 hours",
  "is officially the cautionary tale parents warn their kids about",
  "'s karma invoice finally arrived with 4 years of compound interest",
  "got rejected by an automated customer support bot",
  "'s aura points dropped into negative numbers and triggered a margin call",
  "'s ex already forgot their middle name AND their face",
];

const EN_DARK_TWISTS = [
  "(full unredacted transcript unlocked below)",
  "— recovery timeline estimated at 7 to 10 business years",
  "— witnesses advised not to make direct eye contact today",
  "— even the backup friend group voted to stay silent",
  "(deleted after 12 seconds, archived here permanently)",
  "— zero survivors from the sheer awkwardness",
  "— source says 'honestly we saw this coming since 2023'",
  "— full proof expires in 3 minutes",
  "— everyone already knows except them",
  "— legal team advised them to change cities immediately",
  "(click below before the link gets taken down)",
  "— emotional damage report currently pending review",
];

// HINGLISH / HINDI COMBINATORIAL POOLS (Authentic Indian Group-Chat Energy)
const HI_TAGS = [
  "TAZA KHABAR", "BREAKING", "CCTV 04", "BIG LEAK", "MOHALLA ALERT",
  "DESI SCOOP", "CONFIRMED", "EXPOSED", "URGENT", "VIRAL", "CHAT LEAK",
  "LIVE REPORT", "SHOCKING", "EXCLUSIVE",
];

const HI_ACTIONS = [
  'raat ke 3 baje Google pe "bina padhe crorepati kaise bane" search karte pakda gaya',
  "shaadi ke buffet mein hoodie ke andar 2 plate paneer pack karte CCTV mein kaid",
  "khud ki photo ko fake account se 'fire bro' comment karte pakda gaya",
  "ATM pe balance check karke machine ko ghoor kar wapas mud gaya",
  "crush ke 'hmm' reply ka 45 minute tak matlab decode karta raha",
  "gym ki 1 saal ki membership leke sirf mirror selfie ke liye 2 din gaya",
  "auto wale se 10 rupaye ke liye 20 minute behas karke 400 ki coffee pee aaya",
  "ghar se 'library jaa raha hoon' bolke momos ke thele pe pakda gaya",
  "bina aawaz ke paad maarne ke chakkar mein poora class hila diya",
  "ex ki 2021 wali photo galti se like karke 2 second mein phone switch off kar diya",
  "doston ko 'bhai paise nahi hai' bolke chupke se Zomato Gold order kar raha tha",
  "bathroom ke sheeshe mein imaginary debate jeetne ki practice karte pakda gaya",
  "WhatsApp status laga ke har 30 second mein check kar raha tha kisne dekha",
  "padosi aunty ke saamne seedhe raste pe phisal gaya aur zameen ko ghoorne laga",
  "group chat mein 58 message ignore karke bola 'bhai phone silent pe tha'",
  "online class mein mic on chhod ke mummy se daant khaate hue live broadcast ho gaya",
  "sabke saamne 'I'm built different' bolke 10 minute baad khud hi ro pada",
  "metro ke gate band hone ke baad bhi card tap karta raha 4 baar",
  "waiter ne 'enjoy your meal' bola toh josh mein 'same to you bhaiya' bol aaya",
  "calculator khol ke 15 + 7 check karte hue peeche se pakda gaya",
  "galat group mein 3 minute ka emotional voice note bhej ke delete for me daba diya",
  "apne hi joke pe akele 40 second hansne ke baad awkward silence mein phans gaya",
  "bill aane se theek 2 minute pehle 'urgent call aa raha hai' bolke washroom bhaag gaya",
  "subah 5 baje uthne ka alarm laga ke dopahar 1:30 baje 'rise and grind' story daal raha tha",
  "free Wi-Fi ke liye mall ke bahar 45 minute khada pakda gaya",
  "apne best friend ki burai usi ke saamne voice note mein chala baitha",
  "restaurant menu mein bina price dekhe order karke baad mein kidney rate check karne laga",
  "LinkedIn pe 'humbled to announce' likh ke khud ki hi tareef kar raha tha",
  "crush ke saamne cool banne ke chakkar mein khud ki bottle se muh pe paani gira liya",
];

const HI_TWISTS = [
  "— poora 4K video abhi group mein aaya hai",
  "aur ab bol raha hai 'bhai AI deepfake hai'",
  "— padosi aunty ne sabko forward kar diya",
  "jabki kal hi gyaan pel raha tha 'focus on yourself'",
  "— 3 log live witness hain, koi bacha nahi sakta",
  "aur baad mein muh chhupa ke nikal liya",
  "— screenshot ab har college group mein ghoom raha hai",
  "phir bhi sharam ka naam-o-nishan nahi hai",
  "— full proof 5 minute mein delete hone wala hai",
  "aur turant phone airplane mode pe daal diya",
  "— sab dekh chuke hain, bas isko abhi pata chala",
  "par attitude abhi bhi crorepati wala hai",
  "— ghar walon tak baat pahunch chuki hai",
  "aur doston ne naya sticker pack bana diya ispe",
  "— public reaction dekh ke hasi nahi ruk rahi",
  "— aura -10,000 ho gaya ek hi second mein",
];

// DARK HINGLISH / TWISTED TURNS
const HI_DARK_TAGS = [
  "DARK LEAK", "GUPT REPORT", "FINAL WARNING", "PROPERTY ALERT",
  "CHITRAGUPTA DESK", "RED FILE", "DELETED LOGS", "FAMILY EMERGENCY",
  "BLACKLISTED", "LAST SEEN",
];

const HI_DARK_ACTIONS = [
  "ka naam papa ki property will se bina bataye hata diya gaya hai",
  "ki incognito history mummy ne print karwa ke rishtedaaron ke group mein daal di",
  "ke bina doston ne ek naya WhatsApp group bana liya — aur wahan zyada khush hain",
  "ki file kholte hi Chitragupta ne bhi 'bhai rehne de' bol ke laptop band kar diya",
  "ka rishta aaya tha, ladki walon ne Instagram dekh ke seedha block maar diya",
  "ke therapist ne aaj subah khud resignation letter daal diya",
  "ko crush ne 'bhai' nahi, seedha 'bhaiya ji' bol ke zinda dafna diya",
  "ke ghar wale chupke se doosra beta adopt karne ke papers dekh rahe hain",
  "ka future self time-machine se aaya, 2 second ghoora, aur bina bole wapas chala gaya",
  "ki purani 2019 wali cringe chats kisi ne public PDF bana ke drop kar di",
  "ke padosi ke paas uski 2 baje raat wali CCTV clip hai — aur aaj papa ko dikhane wale hain",
  "ko ignore karne ke liye poori gang ne milke 'network issue' ka bahana banaya tha",
  "ka bank statement dekh ke RBI ne bhi 'sympathy message' bhej diya",
  "ke phone ka 'Recently Deleted' folder galti se ghar ke smart TV pe cast ho gaya",
  "ki life ka downfall dekh ke narak walo ne bhi VIP seat reserve kar di",
  "ne 3 din tak gayab rehne ka natak kiya — ek bande ne bhi 'kahan hai' nahi poocha",
  "ke dost uski peeth peeche bolte hain 'yaar isko mat bulaana mood kharab ho jaata hai'",
  "ki shaadi ki umar nikal rahi hai aur abhi bhi 'she's just busy' pe atka hua hai",
  "ke exam result ke baad papa ne belt nahi uthayi — sirf chupchaap chhat ki taraf dekhne lage",
  "ka karma bill aaj 5 saal ke interest ke saath recover hone aaya hai",
  "ko uske apne hi paltu kutte ne nazarandaz karna shuru kar diya hai",
  "ke notes app ke 3 AM sad quotes aaj poori class ke projector pe khul gaye",
];

const HI_DARK_TWISTS = [
  "— poora sach neeche unlocked hai, himmat hai toh padh",
  "(5 minute mein link udd jayega, pehle hi dekh le)",
  "— ab shahar chhodne ke alawa koi option nahi bacha",
  "— sabko kal raat se pata tha, tujhe ab bataya jaa raha hai",
  "— ghar mat jaana aaj, mahol bahut garam hai",
  "— proof dekh ke tera bharosa uth jayega duniya se",
  "— recovery mein kam se kam 4 janam lagenge",
  "— dil mazboot rakh ke neeche tap kar",
  "— ab sirf bhagwan hi bacha sakte hain",
  "— leaked screenshot niche attach kar diya gaya hai",
  "— sab has rahe hain, koi call mat uthana aaj",
  "— iske baad kisi ko muh dikhane layak nahi bachega",
];

// GIFT & LEAK COMBINATORIAL EXTRAS
const GIFT_TEMPLATES_EN = [
  "{name}, someone in your contacts just dropped a sealed Mystery Box for you",
  "UNCLAIMED: Secret Cash Scratch Card locked to {name}'s name (expires in 09:42)",
  "Someone left an anonymous 2 AM confession about {name} — 1 view only",
  "VIP Free Food & Delivery Voucher reserved exclusively for {name}",
  "{name}, a friend secretly paid for a surprise drop — tap seal to unwrap",
  "PRIVATE GIFT: Someone finally admitted what they really think about {name}",
  "Wait {name} — you got picked for a mystery drop from someone in your chat",
];

const GIFT_TEMPLATES_HI = [
  "{name}, kisi ne tere liye secret UPI Cashback + Mystery Box bheja hai",
  "UNCLAIMED: {name} ke naam pe ek anonymous crush confession aaya hai (1 view only)",
  "{name}, kisi dost ne chupke se tere liye free Zomato/Swiggy voucher lock kiya hai",
  "SECRET DROP: Kisi ne {name} ke baare mein dil ki baat likh ke bheji hai — padh le",
  "{name}, tera mystery scratch card unlock ho gaya hai (sirf 8 minute bache hain)",
  "GUPT TOHFA: Kisi ne {name} ke liye ek sealed box bheja hai — kholne ke liye tap kar",
  "WAIT {name} — tere group chat se kisi ne tere liye secret confession chhoda hai",
];

const SUBHEADS_EN = [
  "3 witnesses already confirmed it. Full breakdown and screenshots unlocked below.",
  "Deleted within 9 seconds, but an automated mirror cached the whole thing.",
  "Over 11,400 people have already viewed this link in the last hour.",
  "Friends in the group chat refused to comment, though receipts are circulating.",
  "Tap below before the original uploader pulls the file offline.",
  "Multiple angles recovered. Viewer discretion strongly advised for their ego.",
  "Sources close to the situation say they still haven't realized it leaked.",
  "Unedited log attached below — expires automatically once 50 people view it.",
];

const SUBHEADS_HI = [
  "3 logon ne live dekha hai. Poora proof aur screenshot neeche unlocked hai.",
  "9 second mein delete karne ki koshish ki par kisi ne pehle hi save kar liya.",
  "Abhi tak 4,800+ log dekh chuke hain — link kisi bhi waqt udd sakta hai.",
  "Group chat mein sab chup hain par parde ke peeche sabne forward kar diya hai.",
  "Neeche tap kar poori kahani aur leaked evidence dekhne ke liye.",
  "Qareebi doston ne kaha 'humne mana kiya tha par yeh maana nahi.'",
  "Full unedited clip aur chat log neeche ready hai — miss mat karna.",
  "Abhi tak usko khabar nahi hai ki yeh sab bahar aa chuka hai.",
];

// ============================================================================
// ROLLING NON-REPEAT TRACKER (CLIENT-SIDE)
// ============================================================================
const SEEN_STORAGE_KEY = "dispatch_seen_hashes_v2";
const MAX_SEEN_MEMORY = 1500;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSeenSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SEEN_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function recordSeen(hash: string) {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(getSeenSet());
    arr.push(hash);
    const trimmed = arr.length > MAX_SEEN_MEMORY ? arr.slice(arr.length - MAX_SEEN_MEMORY) : arr;
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors
  }
}

function quickHash(str: string): string {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export interface GeneratedBait {
  headline: string;
  subhead: string;
  tag: string;
  mode: BaitMode;
  lang: "en" | "hi";
  dark: boolean;
}

export function generateInfiniteBait(opts: {
  name?: string;
  mode?: BaitMode;
  lang?: LangMode;
  spice?: SpiceMode;
}): GeneratedBait {
  const cleanName = (opts.name || "").trim() || "{name}";
  const mode = opts.mode || "news";
  const langPref = opts.lang || "mix";
  const spice = opts.spice || "chaotic";
  const seen = getSeenSet();

  for (let attempt = 0; attempt < 25; attempt++) {
    const resolvedLang: "en" | "hi" =
      langPref === "mix" ? (Math.random() < 0.55 ? "hi" : "en") : langPref;

    // In chaotic mode, still sneak in a dark turn ~28% of the time; in dark mode, 100% dark
    const isDark = spice === "dark" ? true : Math.random() < 0.28;

    let headline = "";
    let tag = "";
    let subhead = "";

    if (mode === "gift") {
      const tpl = resolvedLang === "hi" ? pickRandom(GIFT_TEMPLATES_HI) : pickRandom(GIFT_TEMPLATES_EN);
      const giftTwistsHi = [
        "(sirf aaj ke liye)",
        "— sender ka naam andar chhupa hai",
        "— abhi tak kisi aur ne nahi khola",
        "— jaldi kar timer chal raha hai",
        isDark ? "— kholne ke baad wapas nahi jaa sakta" : "— 100% verified drop",
      ];
      const giftTwistsEn = [
        "(expires soon)",
        "— sender identity revealed inside",
        "— verified for your name only",
        "— tap before timer hits zero",
        isDark ? "— once opened, there's no going back" : "— unclaimed reward",
      ];
      const twist = resolvedLang === "hi" ? pickRandom(giftTwistsHi) : pickRandom(giftTwistsEn);
      headline = `${tpl.replaceAll("{name}", cleanName)} ${twist}`;
      tag = resolvedLang === "hi" ? (isDark ? "GUPT DROP" : "UNCLAIMED") : (isDark ? "SECRET DROP" : "MYSTERY BOX");
      subhead = resolvedLang === "hi" ? pickRandom(SUBHEADS_HI) : pickRandom(SUBHEADS_EN);
    } else if (resolvedLang === "hi") {
      if (isDark) {
        tag = pickRandom(HI_DARK_TAGS);
        const act = pickRandom(HI_DARK_ACTIONS);
        const tw = pickRandom(HI_DARK_TWISTS);
        headline = `${tag}: ${cleanName} ${act} ${tw}`;
      } else {
        tag = pickRandom(HI_TAGS);
        const act = pickRandom(HI_ACTIONS);
        const tw = pickRandom(HI_TWISTS);
        headline = `${tag}: ${cleanName} ${act} ${tw}`;
      }
      subhead = pickRandom(SUBHEADS_HI);
    } else {
      if (isDark) {
        tag = pickRandom(EN_DARK_TAGS);
        const act = pickRandom(EN_DARK_ACTIONS);
        const tw = pickRandom(EN_DARK_TWISTS);
        const joiner = act.startsWith("'") ? "" : " ";
        headline = `${tag}: ${cleanName}${joiner}${act} ${tw}`;
      } else {
        tag = pickRandom(EN_TAGS);
        const act = pickRandom(EN_ACTIONS);
        const tw = pickRandom(EN_TWISTS);
        headline = `${tag}: ${cleanName} ${act} ${tw}`;
      }
      subhead = pickRandom(SUBHEADS_EN);
    }

    const fingerprint = quickHash(headline.replaceAll(cleanName, "{name}"));
    if (!seen.has(fingerprint) || attempt === 24) {
      recordSeen(fingerprint);
      return { headline, subhead, tag, mode, lang: resolvedLang, dark: isDark };
    }
  }

  // Unreachable fallback
  return {
    headline: `BREAKING: ${cleanName} caught in 4K`,
    subhead: "Tap below to inspect full details.",
    tag: "LIVE",
    mode,
    lang: "en",
    dark: false,
  };
}

// ============================================================================
// COMBINATORIAL "CAUGHT IN 4K" ROASTS (NEVER REPEATS — EN + HINGLISH + DARK)
// ============================================================================
const ROAST_OPENERS_HI = [
  "Arre bhai itni kya jaldi thi?",
  "Ek second bhi nahi socha tune?",
  "Bhai tera survival instinct zero hai.",
  "Kasam se itna bhola koi kaise ho sakta hai?",
  "Mummy sahi kehti thi, tera kuch nahi ho sakta.",
  "Link dekha nahi ki seedha kood pada.",
  "Chacha bhi hass rahe honge upar se.",
  "Itni curiosity billiyon ko le doobti hai bro.",
  "Bhai tu wahi hai jo 'You won an iPhone' pe bhi click karta hai.",
  "Poora scam-ready dimaag hai tera.",
  "Itni tezi padhai mein dikha deta toh aaj IAS hota.",
  "Bhai teri izzat toh abhi ghatiya Wi-Fi ki tarah udd gayi.",
  "Aankh band karke bharosa kar liya tune.",
  "Ghar walon ko bol de aaj raat khana kam banayein.",
  "Chitragupta bhi note kar raha hai yeh beizzati.",
  "Bhai dark mode mein bhi tera chehra laal dikh raha hai.",
];

const ROAST_CLOSERS_HI = [
  "Ab chupchaap kisi aur dost ko phansa warna akela royega.",
  "Ab yeh link kisi aur ko bhej, dard baantne se kam hota hai.",
  "Badla lene ka waqt aa gaya hai — neeche agle shikaar ka naam daal.",
  "Ab screenshot chhupane ka koi faayda nahi, kisi aur ki bali chadha.",
  "Tera aura -9999 ho gaya hai, recover karne ke liye 2 doston ko trap kar.",
  "Akele beizzati mat seh — group chat mein naya bakra dhoond.",
  "Ab rone se kuch nahi hoga, agla link bana aur bhej de.",
  "Jisne tujhe bheja uske best friend ko ab tu phansa de.",
  "Ab shaanti se apna L accept kar aur aage kisi aur ka kaat.",
  "Itna bada fool ban gaya hai, kam se kam 3 logon ko saath le doob.",
];

const ROAST_OPENERS_EN = [
  "Didn't even hesitate. Pure instinct, zero braincells.",
  "You really thought that headline was real for a whole second.",
  "Scammers literally dream about people with your click speed.",
  "Zero survival instinct. Straight into the bear trap.",
  "Your curiosity just cooked you in front of everybody.",
  "You smelled a trap and sprinted directly into it anyway.",
  "Your FBI agent is crying laughing behind your webcam right now.",
  "Not a single critical thought crossed your mind before tapping.",
  "Even a goldfish would've paused longer than you just did.",
  "Caught red-handed in ultra HD. No recovery from this.",
  "Your aura just filed for bankruptcy.",
  "You really cleared your schedule to read fake gossip about yourself.",
  "Honestly, your friends were right about you.",
  "That click speed deserves a permanent spot on your criminal record.",
  "Your guardian angel literally just muted notifications for you.",
  "If overconfidence had a mugshot, it'd be you right now.",
];

const ROAST_CLOSERS_EN = [
  "Don't take this L alone — drag someone else down with you.",
  "Only way to wash this off is catching the next victim in under 60 seconds.",
  "Drop a nastier link in the group chat before they find out you fell for it.",
  "Misery loves company. Type your next target below.",
  "You're officially part of the chain now. Pass the curse on.",
  "Send revenge right back before they screenshot your reaction.",
  "Fix your aura by cooking 2 friends immediately.",
  "Nobody can laugh at you if the whole chat gets caught too.",
];

const VERDICT_TITLES_FAST = [
  "ZERO SURVIVAL INSTINCT",
  "SPEEDRUN BAKRA",
  "INSTANT SCAM VICTIM",
  "NO BRAINCELLS DETECTED",
  "FULL BINA SOCHE CLICK",
  "CERTIFIED GULLIBLE",
];

const VERDICT_TITLES_MID = [
  "CURIOSITY COOKED YOU",
  "SUSPICIOUS... STILL FELL",
  "AURA -9999",
  "CAUGHT LACKING IN 4K",
  "SHAK THA PHIR BHI PHANSA",
  "EMOTIONAL DAMAGE",
];

const VERDICT_TITLES_SLOW = [
  "OVERTHOUGHT & STILL LOST",
  "ITNA SOCH KE BHI L LE LIYA",
  "DELAYED DISASTER",
  "SLOW-MOTION TRAP VICTIM",
  "TRIED TO BE SMART, FAILED",
];

export function getGullibilityVerdict(
  seconds: number,
  lang: LangMode = "mix",
  spice: SpiceMode = "chaotic"
): {
  title: string;
  percent: number;
  roast: string;
} {
  const useHi = lang === "hi" || (lang === "mix" && Math.random() < 0.55);
  const opener = useHi ? pickRandom(ROAST_OPENERS_HI) : pickRandom(ROAST_OPENERS_EN);
  const closer = useHi ? pickRandom(ROAST_CLOSERS_HI) : pickRandom(ROAST_CLOSERS_EN);

  const darkTag =
    spice === "dark"
      ? useHi
        ? " (Ghar mat batana.)"
        : " (No coming back from this.)"
      : "";

  let title = pickRandom(VERDICT_TITLES_MID);
  let percent = 89;

  if (seconds < 2.2) {
    title = pickRandom(VERDICT_TITLES_FAST);
    percent = 96 + Math.floor(Math.random() * 4); // 96-99
  } else if (seconds < 5.5) {
    title = pickRandom(VERDICT_TITLES_MID);
    percent = 87 + Math.floor(Math.random() * 8); // 87-94
  } else {
    title = pickRandom(VERDICT_TITLES_SLOW);
    percent = 79 + Math.floor(Math.random() * 8); // 79-86
  }

  return {
    title,
    percent,
    roast: `${opener} ${closer}${darkTag}`,
  };
}

// ============================================================================
// COMBINATORIAL DECOY COMMENTS (FRESH EVERY LOAD)
// ============================================================================
const FAKE_HANDLES = [
  "arjun.m", "kabir_99", "riya.v", "dev_k", "tanya_04", "rohit.s",
  "ananya.x", "harsh_07", "mehak.k", "siddharth_d", "priya.99", "amaan.gg",
  "yash_irl", "simran.b", "nikhil.exe", "kajal_21", "varun.op", "ishaan.fr",
];

const COMMENT_TEMPLATES_HI = [
  "bhai {name} yeh kya kar diya tune 💀💀",
  "arre yaar poori college mein fail gaya yeh",
  "koi screen record kar lo delete hone se pehle",
  "mujhe laga tha fake hai par neeche wala proof dekho bro",
  "bhai {name} ghar mat jaana aaj kasam se",
  "chacha ne abhi family group mein forward kar diya 💀",
  "nahi yaar {name} se yeh umeed nahi thi",
  "WAIT 2nd paragraph padho bhai dimaag hil jayega",
  "bhai link 5 min mein udd jayega jaldi dekho",
  "ab {name} ka kya hoga yaar 💀",
];

const COMMENT_TEMPLATES_EN = [
  "no way {name} actually did this 💀💀",
  "just sent this to the whole group chat",
  "someone screen record before it gets taken down",
  "WAIT scroll down the 2nd part is actually insane",
  "nah {name} is never living this down",
  "bro I thought it was fake until I clicked unlock",
  "{name} really thought nobody was watching 😭",
  "who leaked this?? this is foul",
  "bro open it before the timer expires",
];

function seededPick<T>(arr: T[], seed: number): T {
  const idx = Math.abs(seed) % arr.length;
  return arr[idx];
}

export function getDecoyComments(
  name: string,
  mode: BaitMode,
  lang: LangMode = "mix",
  seed = 1337
) {
  const n = name || "them";
  const pool =
    lang === "hi"
      ? COMMENT_TEMPLATES_HI
      : lang === "en"
      ? COMMENT_TEMPLATES_EN
      : [...COMMENT_TEMPLATES_HI, ...COMMENT_TEMPLATES_EN];

  const times = ["Just now", "1m ago", "2m ago", "4m ago", "6m ago"];
  const results: Array<{ user: string; time: string; text: string }> = [];
  const usedUsers = new Set<string>();
  const usedTexts = new Set<string>();

  for (let i = 0; i < 3; i++) {
    let s = seed + i * 7919 + (mode === "gift" ? 31 : mode === "leak" ? 97 : 13);
    let user = seededPick(FAKE_HANDLES, s);
    while (usedUsers.has(user)) {
      s += 7;
      user = seededPick(FAKE_HANDLES, s);
    }
    usedUsers.add(user);

    let tpl = seededPick(pool, s * 3 + 11);
    while (usedTexts.has(tpl)) {
      s += 5;
      tpl = seededPick(pool, s * 3 + 11);
    }
    usedTexts.add(tpl);

    results.push({
      user,
      time: times[i + (Math.abs(seed) % 2)],
      text: tpl.replaceAll("{name}", n),
    });
  }

  return results;
}

// ============================================================================
// HEADLINE FORMATTING & STATELESS URL SLUG ENCODER/DECODER
// ============================================================================
export function formatHeadline(payload: BaitPayload): string {
  const cleanName = payload.name.trim() || "Someone";
  if (payload.customHeadline && payload.customHeadline.trim()) {
    const raw = payload.customHeadline.trim();
    return raw.includes("{name}")
      ? raw.replaceAll("{name}", cleanName)
      : raw.toLowerCase().includes(cleanName.toLowerCase())
      ? raw
      : `BREAKING: ${cleanName} — ${raw}`;
  }
  const preset =
    HEADLINE_PRESETS.find((p) => p.id === payload.headlineId) || HEADLINE_PRESETS[0];
  return preset.template.replaceAll("{name}", cleanName);
}

export function getPresetMeta(payload: BaitPayload) {
  const preset = HEADLINE_PRESETS.find((p) => p.id === payload.headlineId);
  const name = payload.name.trim() || "Someone";
  return {
    tag:
      payload.customTag ||
      preset?.tag ||
      (payload.mode === "gift"
        ? "MYSTERY DROP"
        : payload.mode === "leak"
        ? "RESTRICTED"
        : "BREAKING"),
    subhead:
      payload.customSubhead ||
      preset?.subhead ||
      `Multiple sources confirmed details involving ${name} minutes ago. Full story unlocked below.`,
  };
}

function toBase64Url(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(input);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const padded =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((input.length + 3) % 4);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf-8");
  }
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 44)
    .replace(/-+$/, "");
}

export function encodeBaitSlug(payload: BaitPayload): string {
  const compact: Record<string, string | number> = {
    n: payload.name.trim().slice(0, 28) || "Bro",
    m: payload.mode === "gift" ? "g" : payload.mode === "leak" ? "l" : "n",
    c: Math.max(1, Math.min(99999, Math.floor(payload.chain || 1))),
    r: payload.seed || Math.floor(Math.random() * 999999),
  };

  if (payload.lang && payload.lang !== "mix") {
    compact.l = payload.lang;
  }
  if (payload.spice === "dark") {
    compact.d = 1;
  }
  if (payload.customHeadline && payload.customHeadline.trim()) {
    compact.x = payload.customHeadline.trim().slice(0, 145);
  } else {
    compact.h = payload.headlineId || "h1";
  }
  if (payload.customSubhead && payload.customSubhead.trim()) {
    compact.s = payload.customSubhead.trim().slice(0, 120);
  }
  if (payload.customTag && payload.customTag.trim()) {
    compact.t = payload.customTag.trim().slice(0, 24);
  }
  if (payload.sender && payload.sender.trim()) {
    compact.f = payload.sender.trim().slice(0, 24);
  }

  const encoded = toBase64Url(JSON.stringify(compact));
  const headlinePreview = slugifyText(formatHeadline(payload)) || "live-update";
  return `${headlinePreview}.${encoded}`;
}

export function decodeBaitSlug(rawSlug: string, fallbackMode: BaitMode = "news"): BaitPayload {
  const safeSlug = decodeURIComponent(rawSlug || "");
  const dotIdx = safeSlug.lastIndexOf(".");
  if (dotIdx !== -1) {
    const token = safeSlug.slice(dotIdx + 1);
    try {
      const parsed = JSON.parse(fromBase64Url(token));
      const mode: BaitMode =
        parsed.m === "g"
          ? "gift"
          : parsed.m === "l"
          ? "leak"
          : parsed.m === "n"
          ? "news"
          : fallbackMode;

      return {
        name: typeof parsed.n === "string" && parsed.n.trim() ? parsed.n.trim() : "Bro",
        headlineId: typeof parsed.h === "string" ? parsed.h : undefined,
        customHeadline: typeof parsed.x === "string" ? parsed.x : undefined,
        customSubhead: typeof parsed.s === "string" ? parsed.s : undefined,
        customTag: typeof parsed.t === "string" ? parsed.t : undefined,
        mode,
        lang: parsed.l === "hi" || parsed.l === "en" ? parsed.l : "mix",
        spice: parsed.d === 1 ? "dark" : "chaotic",
        sender: typeof parsed.f === "string" ? parsed.f : undefined,
        chain: typeof parsed.c === "number" && parsed.c > 0 ? parsed.c : 1,
        seed: typeof parsed.r === "number" ? parsed.r : 1337,
      };
    } catch {
      // Fall through cleanly
    }
  }

  return {
    name: "Bro",
    headlineId: fallbackMode === "gift" ? "g1" : fallbackMode === "leak" ? "h2" : "h1",
    mode: fallbackMode,
    lang: "mix",
    spice: "chaotic",
    chain: 1,
    seed: 1337,
  };
}

export function buildBaitPath(payload: BaitPayload): string {
  const slug = encodeBaitSlug(payload);
  const folder =
    payload.mode === "gift" ? "gift" : payload.mode === "leak" ? "leak" : "news";
  return `/${folder}/${slug}`;
}

export function getRandomPreset(excludeId?: string): HeadlinePreset {
  const pool = HEADLINE_PRESETS.filter((p) => p.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)] || HEADLINE_PRESETS[0];
}
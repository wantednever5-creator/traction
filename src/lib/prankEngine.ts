// src/lib/prankEngine.ts

export type BaitMode = "news" | "gift" | "leak";
export type LangMode = "mix" | "en" | "hi";
export type SpiceMode = "chaotic" | "dark";
export type HeadlineCategory = "hinglish" | "en" | "dark" | "gift";

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

// Clean starter picks
export const HEADLINE_PRESETS: HeadlinePreset[] = [
  {
    id: "h1",
    category: "hinglish",
    mode: "news",
    lang: "hi",
    template: "LEAKED: {name} ki ChatGPT history mein 30 baar 'how to reply to hmm' search mila",
    tag: "LEAKED",
    subhead: "Screenshots abhi group mein aaye hain. Delete hone se pehle dekh le.",
  },
  {
    id: "h2",
    category: "hinglish",
    mode: "leak",
    lang: "hi",
    template: "EXPOSED: {name} ne March mein ₹500 UPI udhaar liye the, tabse selective amnesia chal raha hai",
    tag: "RECEIPTS",
    subhead: "Chat screenshots aur pending request niche attach kar di gayi hai.",
  },
  {
    id: "h3",
    category: "hinglish",
    mode: "news",
    lang: "hi",
    template: "CONFIRMED: {name} 'bhai busy hoon' bolke 6 ghante se bed pe reels scroll kar raha hai",
    tag: "LIVE",
    subhead: "Screen time stats aur last seen dono match ho gaye hain.",
  },
  {
    id: "d1",
    category: "dark",
    mode: "leak",
    lang: "hi",
    dark: true,
    template: "LEAKED: Doston ne {name} ke bina naya WhatsApp group bana liya — ab roz plans ban rahe hain",
    tag: "CHAT LEAK",
    subhead: "Member list aur pehle 3 messages niche unlocked hain.",
  },
  {
    id: "d2",
    category: "dark",
    mode: "leak",
    lang: "en",
    dark: true,
    template: "CONFIRMED: {name} tried going off the grid for 5 days — literally nobody texted to check",
    tag: "REPORT",
    subhead: "Full breakdown of the silence below.",
  },
  {
    id: "e1",
    category: "en",
    mode: "news",
    lang: "en",
    template: "EXCLUSIVE: {name} paid for Hinge+ and still ended the week with zero likes",
    tag: "EXCLUSIVE",
    subhead: "Profile review and screenshots circulating in the group chat.",
  },
  {
    id: "e2",
    category: "en",
    mode: "leak",
    lang: "en",
    template: "EXPOSED: {name} keeps a burner account just to watch people who already blocked them",
    tag: "ARCHIVE",
    subhead: "Accidental story view gave the whole account away at 2:14 AM.",
  },
  {
    id: "g1",
    category: "gift",
    mode: "gift",
    lang: "hi",
    template: "{name}, kisi ne tere liye secret confession chhoda hai (1 view only)",
    tag: "PRIVATE",
    subhead: "Kholne ke baad automatically delete ho jayega.",
  },
  {
    id: "g2",
    category: "gift",
    mode: "gift",
    lang: "en",
    template: "Someone in your contacts left an anonymous note about {name}",
    tag: "UNREAD",
    subhead: "Visible once. Tap to see who sent this.",
  },
];

// ============================================================================
// NON-REPEATING COMBINATORIAL ENGINE (DRY, SPECIFIC, HUMAN)
// ============================================================================

const EN_TAGS = ["BREAKING", "EXCLUSIVE", "LEAKED", "CONFIRMED", "REPORT", "JUST IN", "EXPOSED", "LIVE"];
const HI_TAGS = ["BREAKING", "LEAKED", "EXPOSED", "CONFIRMED", "REPORT", "CHAT LEAK", "URGENT", "VIRAL"];
const DARK_TAGS = ["LEAKED", "CONFIRMED", "ARCHIVE", "REPORT", "PRIVATE LOG", "EXPOSED"];

const EN_CORES = [
  "paid for Hinge+ and still ended the week with zero likes",
  "'s ChatGPT history is just 30 prompts asking how to reply to 'wyd'",
  "spent $200 on gym supplements just to hit 3 sets of mirror selfies",
  "checks if their ex viewed their story within 12 seconds of posting",
  "told everyone they're 'building a startup' — it's one empty Notion doc",
  "got left on seen for 4 days and still replied in 9 seconds",
  "borrowed money two months ago and suddenly developed selective amnesia",
  "keeps a burner account just to watch people who already blocked them",
  "acts mysterious in group chats because they genuinely have nothing going on",
  "practiced a casual 'hey' for 25 minutes and still got left on delivered",
  "bragged about pulling an all-nighter after scrolling reels for 6 hours",
  "posted 'moving in silence' right after telling 9 people their business",
  "put 'entrepreneur' in their bio after flipping one pair of sneakers",
  "got aired in the group chat and quietly deleted their message 3 minutes later",
  "still thinks a 2-week situationship from last year 'meant something'",
  "'s camera roll is 60% screenshots of chats nobody asked to see",
  "faked a bad signal right when the restaurant bill hit the table",
  "says 'we should catch up soon' and prays nobody picks a date",
  "argued in a YouTube comment section for 3 hours on a Tuesday",
  "typed a 4-paragraph rant, panicked, and sent 'all good bro'",
  "still replays one mild compliment from 2022 like a career highlight",
  "joined the call 12 minutes late and just said 'makes sense' twice",
  "muted the group chat waiting for someone to notice they were quiet",
  "posted a 5 AM grind quote and went straight back to sleep till noon",
  "swore they were 'over it' right before checking their ex's following list",
  "told everyone they're 'taking a break from dating' like it was their choice",
];

const EN_TWISTS = [
  "— screenshots just dropped",
  "— full chat log unlocked below",
  "(deleted 40 seconds too late)",
  "— 3 witnesses already confirmed",
  "— receipts circulating in the chat",
  "(link expires in 5 mins)",
  "— zero recovery from this",
  "— full breakdown inside",
  "— everyone saw it except them",
  "(archived before they could delete)",
];

const EN_DARK_CORES = [
  "'s friends made a second group chat without them — plans immediately started happening",
  "has been the backup plan for someone else's backup plan since 2024",
  "'s parents stopped asking about their career plans out of pure politeness",
  "walked out of the room and everyone immediately started talking louder",
  "peaked during high school exams and has been coasting on fumes since",
  "tried going off the grid for 5 days — literally nobody texted to check",
  "'s ex already forgot their birthday, last name, and face",
  "is the friend people only text when the first 4 options cancel",
  "'s weekly screen time report just qualified as a cry for help",
  "asked 'be honest, am I the problem?' and 5 people started typing at once",
  "got rejected so politely they didn't realize it for three weeks",
  "gives dating advice like someone who hasn't been texted first since 2023",
  "brings zero plans, zero rides, and maximum opinions to every hangout",
  "'s 'villain era' is just sitting alone at 2 AM liking sad reels",
  "calls themselves 'low maintenance' because nobody has ever tried for them",
  "'s close friends list has 20 people, and none of them put them on theirs",
  "is only in the group chat for attendance at this point",
  "thinks people are jealous when nobody actually thinks about them at all",
];

const EN_DARK_TWISTS = [
  "— full receipts below",
  "(unredacted log attached)",
  "— everybody already knew except them",
  "(expires after 50 views)",
  "— read the screenshots before it's pulled",
  "— confirmed by multiple people",
  "— no coming back from this one",
];

const HI_CORES = [
  "ne Bumble Premium liya aur poore hafte mein sirf 1 bot ne match kiya",
  "ki ChatGPT history mein 30 baar 'how to reply to hmm' search mila",
  "ne March mein ₹500 UPI udhaar liye the, tabse selective amnesia chal raha hai",
  "gym mein 15 minute workout aur 45 minute mirror lighting check karta hai",
  "4 din se seen pe chhoda gaya tha, phir bhi 8 second mein reply kar diya",
  "story daalne ke baad har 20 second mein check karta hai ex ne dekha ya nahi",
  "'bhai busy hoon' bolke 6 ghante se bed pe reels scroll kar raha hai",
  "ke paas ek fake account hai sirf unko stalk karne ke liye jinhone block kar rakha hai",
  "bio mein 'moving in silence' likh ke har bande ko apni poori kahani sunata hai",
  "bill aane se 2 minute pehle hamesha 'network chala gaya' bolke gayab ho jaata hai",
  "2 hafte ki situationship pe abhi tak raat 2 baje sad quotes daal raha hai",
  "ne 4 paragraph ka comeback likha, phir dar ke 'koi nahi bro' bhej diya",
  "group chat mein ignore hone ke baad khud hi apna message delete kar deta hai",
  "'jaldi milte hain' bolta hai aur mann mein dua karta hai koi date fix na kare",
  "ne 2022 ki ek chhoti si compliment ko abhi tak apni poori personality bana rakha hai",
  "5 minute late hoke bolta hai 'bas pahunch gaya' — jabki abhi ghar se nikla bhi nahi",
  "ne impress karne ke chakkar mein aisi playlist bheji ki saamne wale ne unfollow kar diya",
  "har Monday bolta hai 'is hafte se life track pe launga' — 2023 se yahi chal raha hai",
  "cool banne ke chakkar mein account ke aakhri ₹350 ki cold coffee pee baitha",
  "ne 'startup pe kaam chal raha hai' bola tha — laptop mein sirf ek khaali doc hai",
  "apni hi photo dusre account se like karke reach badhane ki koshish kar raha hai",
  "3 minute ka gyaan wala voice note bhej ke end mein bolta hai 'baaki teri marzi'",
  "har ladai mein 'chhod yaar mujhe farak nahi padta' bolke 2 ghante tak status dekhta rehta hai",
  "subah 5 baje uthne ka story daal ke 5:10 pe wapas so gaya",
  "ke camera roll mein 70% bas doosron ke chat screenshots bhare pade hain",
  "ne 'I'm focusing on myself' bol diya kyunki koi aur focus hi nahi kar raha tha",
];

const HI_TWISTS = [
  "— screenshots group mein aa gaye hain",
  "(40 second baad delete kiya, par save ho gaya)",
  "— poori chat niche unlocked hai",
  "— 3 logon ne live confirm kiya hai",
  "(5 minute mein link udd jayega)",
  "— ab bahana bhi nahi maar sakta",
  "— sab dekh chuke hain, bas isko abhi pata chala",
  "— proof niche attach kar diya hai",
  "— screenshot ab college group mein ghoom raha hai",
  "— full details niche padh",
];

const HI_DARK_CORES = [
  "ke bina doston ne naya WhatsApp group bana liya — ab roz plans ban rahe hain",
  "ke ghar walon ne ab career ke baare mein poochna bhi chhod diya hai",
  "sirf tab bulaya jaata hai jab pehle 4 log plan cancel kar dein",
  "ka peak 10th ke pre-boards mein tha, uske baad sirf downfall chal raha hai",
  "ne 4 din offline reh ke dekha — ek bande ne bhi 'kahan hai' nahi poocha",
  "kisi aur ke backup plan ka bhi backup plan bana baitha hai",
  "jis din room se bahar jaata hai, sabki aawaz thodi khul jaati hai",
  "ka 'villain arc' bas raat 2 baje akele kamre mein sad reels dekhna hai",
  "ki ex ko ab uska surname aur chehra dono yaad nahi aa rahe",
  "ne poocha 'sach bata meri galti thi kya?' — 5 log ek saath typing dikhane lage",
  "rishton pe aise gyaan deta hai jaise 2023 ke baad kisi ne first text kiya ho",
  "har plan mein 0 gaadi, 0 paisa, aur 100% nakhre leke aata hai",
  "ke close friends list mein 18 log hain, par usko kisi ne apne mein nahi rakha",
  "ko lagta hai log usse jalte hain — sach yeh hai ki koi uske baare mein sochta hi nahi",
  "ke itne bure din chal rahe hain ki rishtedaar bhi taana maarne se ruk gaye",
  "group chat mein sirf seen count badhane ke liye bacha hua hai",
];

const HI_DARK_TWISTS = [
  "— poora sach niche unlocked hai",
  "(delete hone se pehle dekh le)",
  "— sabko pehle se pata tha",
  "— chat screenshots niche attach hain",
  "— iske baad koi explanation kaam nahi aayegi",
  "— confirm ho chuka hai, niche padh",
];

const GIFT_HI = [
  "{name}, kisi ne tere liye anonymous confession chhoda hai",
  "{name}, tere contacts se kisi ne ek private note bheja hai",
  "UNREAD: Kisi ne {name} ke baare mein sach likh ke bheja hai",
  "{name}, secret UPI cashback + mystery drop tere naam pe lock hua hai",
  "PRIVATE: {name}, group chat mein se kisi ne tere liye kuch bheja hai",
];

const GIFT_EN = [
  "Someone in your contacts left an anonymous confession about {name}",
  "{name}, someone secretly sent you a private drop",
  "UNREAD: Someone finally admitted what they think about {name}",
  "{name}, a mystery reward was locked to your name",
  "PRIVATE: Someone from your group chat left a note for {name}",
];

const SUBHEADS_EN = [
  "Screenshots attached below before the link gets pulled.",
  "Multiple people already saw it. Full log unlocked inside.",
  "Deleted almost immediately, but a copy was already saved.",
  "Tap below to see the full context.",
  "Auto-deletes once 50 people open this link.",
];

const SUBHEADS_HI = [
  "Screenshots niche attached hain, link uddne se pehle dekh le.",
  "Kafi log dekh chuke hain. Poora log niche unlocked hai.",
  "Turant delete karne ki koshish ki par copy pehle hi save ho gayi.",
  "Poori baat aur proof dekhne ke liye niche tap kar.",
  "50 views ke baad link apne aap expire ho jayega.",
];

// ============================================================================
// NON-REPEAT MEMORY
// ============================================================================
const SEEN_STORAGE_KEY = "dispatch_seen_v3";
const MAX_SEEN = 1500;

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
    const trimmed = arr.length > MAX_SEEN ? arr.slice(arr.length - MAX_SEEN) : arr;
    localStorage.setItem(SEEN_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
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
    const isDark = spice === "dark" ? true : Math.random() < 0.25;

    let headline = "";
    let tag = "";
    let subhead = "";

    if (mode === "gift") {
      const tpl = resolvedLang === "hi" ? pickRandom(GIFT_HI) : pickRandom(GIFT_EN);
      const giftEnd =
        resolvedLang === "hi"
          ? pickRandom(["(1 view only)", "— sender ka naam andar hai", "— 8 min mein expire hoga"])
          : pickRandom(["(1 view only)", "— sender revealed inside", "— expires in 8 mins"]);
      headline = `${tpl.replaceAll("{name}", cleanName)} ${giftEnd}`;
      tag = resolvedLang === "hi" ? "PRIVATE" : "UNREAD";
      subhead = resolvedLang === "hi" ? pickRandom(SUBHEADS_HI) : pickRandom(SUBHEADS_EN);
    } else if (resolvedLang === "hi") {
      tag = isDark ? pickRandom(DARK_TAGS) : pickRandom(HI_TAGS);
      const core = isDark ? pickRandom(HI_DARK_CORES) : pickRandom(HI_CORES);
      const twist = isDark ? pickRandom(HI_DARK_TWISTS) : pickRandom(HI_TWISTS);
      headline = `${tag}: ${cleanName} ${core} ${twist}`;
      subhead = pickRandom(SUBHEADS_HI);
    } else {
      tag = isDark ? pickRandom(DARK_TAGS) : pickRandom(EN_TAGS);
      const core = isDark ? pickRandom(EN_DARK_CORES) : pickRandom(EN_CORES);
      const twist = isDark ? pickRandom(EN_DARK_TWISTS) : pickRandom(EN_TWISTS);
      const joiner = core.startsWith("'") ? "" : " ";
      headline = `${tag}: ${cleanName}${joiner}${core} ${twist}`;
      subhead = pickRandom(SUBHEADS_EN);
    }

    const fp = quickHash(headline.replaceAll(cleanName, "{name}"));
    if (!seen.has(fp) || attempt === 24) {
      recordSeen(fp);
      return { headline, subhead, tag, mode, lang: resolvedLang, dark: isDark };
    }
  }

  return {
    headline: `LEAKED: ${cleanName} caught in 4K`,
    subhead: "Full breakdown unlocked below.",
    tag: "LEAKED",
    mode,
    lang: "en",
    dark: false,
  };
}

// ============================================================================
// DEADPAN ROASTS (SHORT, SHARP, NO GOOBER FILLER)
// ============================================================================
const ROASTS_HI = [
  "Ek second bhi nahi socha. Link dekha aur seedha tap kar diya.",
  "Itni jaldi toh tu kisi ka important message bhi nahi kholta.",
  "Sach mein laga tere baare mein breaking news chal rahi hai?",
  "Zero survival instinct. OTP maang leta toh woh bhi de deta.",
  "Bina soche click karne ki aadat ek din le doobegi.",
  "Teri curiosity ne hi tera kaat diya.",
  "Itna bharosa apne doston pe? Bold move.",
  "Link pe click karte waqt dimaag airplane mode pe tha kya?",
  "Ab chupchaap kisi aur ko phansa — akele L mat le.",
  "Screenshot chhupa ke koi faayda nahi, agle bande ka naam daal.",
];

const ROASTS_EN = [
  "Clicked without a single critical thought.",
  "You really thought someone wrote a whole article about you.",
  "Scammers literally pray for people with your click speed.",
  "You smelled bait and walked straight into it anyway.",
  "Not even two seconds of hesitation. Embarrassing.",
  "If this was a phishing link, your bank account would be empty.",
  "Your curiosity just cooked you in public.",
  "Zero survival instinct. Don't take the L alone — pass it on.",
  "Honestly, your friends were right about you.",
  "Only way to wash this off is catching someone else in 30 seconds.",
];

const ROASTS_DARK_HI = [
  "Sach mein laga log tere baare mein itni baat karte hain?",
  "Koi tere liye secret confession nahi likh raha bro, reality check le.",
  "Itni jaldi toh tera crush bhi tujhe ignore nahi karta.",
  "Ab chupchaap kisi aur ka kaat, warna yahi sabse bada highlight rahega aaj ka.",
];

const ROASTS_DARK_EN = [
  "Bold of you to think anyone cares enough to leak your chats.",
  "Nobody left a secret confession about you. Take the L and pass it on.",
  "You opened this faster than anyone has ever replied to your texts.",
  "At least this time someone actually thought of you.",
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
  let roast: string;
  if (spice === "dark") {
    roast = useHi ? pickRandom(ROASTS_DARK_HI) : pickRandom(ROASTS_DARK_EN);
  } else {
    roast = useHi ? pickRandom(ROASTS_HI) : pickRandom(ROASTS_EN);
  }

  if (seconds < 2.2) {
    return {
      title: useHi ? "BINA SOCHE CLICK" : "ZERO HESITATION",
      percent: 96 + Math.floor(Math.random() * 4),
      roast,
    };
  }
  if (seconds < 5.5) {
    return {
      title: useHi ? "SEEDHA PHANSA" : "CAUGHT LACKING",
      percent: 88 + Math.floor(Math.random() * 7),
      roast,
    };
  }
  return {
    title: useHi ? "SOCH KE BHI L LE LIYA" : "OVERTHOUGHT & LOST",
    percent: 80 + Math.floor(Math.random() * 7),
    roast,
  };
}

// ============================================================================
// DECOY COMMENTS
// ============================================================================
const FAKE_HANDLES = [
  "arjun.m", "kabir_99", "riya.v", "dev_k", "tanya_04", "rohit.s",
  "ananya.x", "harsh_07", "mehak.k", "aman.gg", "yash_irl", "nikhil.exe",
];

const COMMENTS_HI = [
  "bhai {name} yeh kya hai 💀",
  "koi screen record kar lo delete hone se pehle",
  "mujhe laga fake hai par niche wala screenshot dekho",
  "nahi bro {name} se yeh umeed nahi thi",
  "bhai 2nd part padho dimaag hil jayega",
];

const COMMENTS_EN = [
  "no way {name} actually did this 💀",
  "someone save this before it gets pulled",
  "thought it was fake till I opened the second part",
  "bro just drop it in the group chat already",
  "nah {name} is never living this down",
];

function seededPick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
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
      ? COMMENTS_HI
      : lang === "en"
      ? COMMENTS_EN
      : [...COMMENTS_HI, ...COMMENTS_EN];

  const times = ["1m ago", "3m ago", "5m ago"];
  const results: Array<{ user: string; time: string; text: string }> = [];
  const usedU = new Set<string>();
  const usedT = new Set<string>();

  for (let i = 0; i < 3; i++) {
    let s = seed + i * 7919 + (mode === "gift" ? 31 : mode === "leak" ? 97 : 13);
    let user = seededPick(FAKE_HANDLES, s);
    while (usedU.has(user)) {
      s += 7;
      user = seededPick(FAKE_HANDLES, s);
    }
    usedU.add(user);

    let tpl = seededPick(pool, s * 3 + 11);
    while (usedT.has(tpl)) {
      s += 5;
      tpl = seededPick(pool, s * 3 + 11);
    }
    usedT.add(tpl);

    results.push({
      user,
      time: times[i],
      text: tpl.replaceAll("{name}", n),
    });
  }
  return results;
}

// ============================================================================
// FORMATTING & STATELESS URL ENCODER
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
        ? "PRIVATE"
        : payload.mode === "leak"
        ? "LEAKED"
        : "BREAKING"),
    subhead:
      payload.customSubhead ||
      preset?.subhead ||
      `Details involving ${name} just surfaced. Full log below.`,
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

  if (payload.lang && payload.lang !== "mix") compact.l = payload.lang;
  if (payload.spice === "dark") compact.d = 1;
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
    } catch {}
  }

  return {
    name: "Bro",
    headlineId: fallbackMode === "gift" ? "g1" : fallbackMode === "leak" ? "d1" : "h1",
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
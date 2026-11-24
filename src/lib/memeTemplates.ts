// src/lib/memeTemplates.ts

export type MemeFormatId =
  | "viewfinder_4k"
  | "breaking_tv"
  | "thermal_receipt"
  | "pr_apology"
  | "search_leak"
  | "group_poll";

export type MemeTextureId = "clean" | "halftone" | "scanlines" | "paper" | "grid";
export type MemeStampId = "none" | "caught_4k" | "broad_daylight" | "no_recovery" | "certified_l";
export type MemeFontStyle = "brutal" | "editorial" | "terminal" | "clean";

export interface MemePalette {
  id: string;
  name: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  border: string;
  dark: boolean;
}

export interface MemeContent {
  name: string;
  headline: string;
  subline: string;
  // Format-specific structured fields (auto-filled by AI or user)
  saidText: string;      // viewfinder_4k ("SAID:")
  realityText: string;   // viewfinder_4k ("REALITY:")
  tickerText: string;    // breaking_tv bottom ticker
  items: string[];       // thermal_receipt / search_leak / group_poll options (3-4 lines)
  totalLabel: string;    // thermal_receipt bottom punchline
  apologyBody: string;   // pr_apology main paragraph
}

export interface MemeStyleConfig {
  format: MemeFormatId;
  paletteId: string;
  texture: MemeTextureId;
  stamp: MemeStampId;
  fontStyle: MemeFontStyle;
  caseNumber: string;
}

export const MEME_FORMATS: Array<{
  id: MemeFormatId;
  label: string;
  short: string;
  hint: string;
}> = [
  {
    id: "viewfinder_4k",
    label: "4K Camera",
    short: "4K CAM",
    hint: "Caught lying in broad daylight",
  },
  {
    id: "breaking_tv",
    label: "Live TV News",
    short: "TV NEWS",
    hint: "Channel broadcast + bottom ticker",
  },
  {
    id: "thermal_receipt",
    label: "L Receipt",
    short: "RECEIPT",
    hint: "Itemized udhaar / excuses bill",
  },
  {
    id: "pr_apology",
    label: "PR Apology",
    short: "NOTES PR",
    hint: "Celebrity crisis notes statement",
  },
  {
    id: "search_leak",
    label: "Search Leak",
    short: "HISTORY",
    hint: "Cropped Google / ChatGPT history",
  },
  {
    id: "group_poll",
    label: "GC Poll",
    short: "GC POLL",
    hint: "Fake group chat vote landslide",
  },
];

export const MEME_PALETTES: MemePalette[] = [
  {
    id: "newsroom",
    name: "Newsroom Red",
    bg: "#0B0B0B",
    surface: "#151515",
    text: "#F7F7F5",
    muted: "#A3A3A3",
    accent: "#FF2E2E",
    accentText: "#FFFFFF",
    border: "#FFFFFF",
    dark: true,
  },
  {
    id: "nightvision",
    name: "CCTV Night",
    bg: "#050D07",
    surface: "#0A1A0E",
    text: "#D9FFE2",
    muted: "#6BA87A",
    accent: "#00FF66",
    accentText: "#050D07",
    border: "#00FF66",
    dark: true,
  },
  {
    id: "tabloid",
    name: "Tabloid Yellow",
    bg: "#FFE600",
    surface: "#FAF7F0",
    text: "#0B0B0B",
    muted: "#525252",
    accent: "#FF2E2E",
    accentText: "#FFFFFF",
    border: "#0B0B0B",
    dark: false,
  },
  {
    id: "thermal",
    name: "Thermal Paper",
    bg: "#ECE8DC",
    surface: "#F9F6EE",
    text: "#171717",
    muted: "#6B6860",
    accent: "#171717",
    accentText: "#F9F6EE",
    border: "#171717",
    dark: false,
  },
  {
    id: "ios_dark",
    name: "Dark Notes",
    bg: "#121214",
    surface: "#1C1C1F",
    text: "#F4F4F5",
    muted: "#9CA3AF",
    accent: "#F5B800",
    accentText: "#121214",
    border: "#2F2F35",
    dark: true,
  },
  {
    id: "whatsapp_dark",
    name: "Chat Dark",
    bg: "#0B141A",
    surface: "#111B21",
    text: "#E9EDEF",
    muted: "#8696A0",
    accent: "#00A884",
    accentText: "#0B141A",
    border: "#222E35",
    dark: true,
  },
  {
    id: "cobalt",
    name: "Broadcast Blue",
    bg: "#08142B",
    surface: "#0E2147",
    text: "#FFFFFF",
    muted: "#93B4E8",
    accent: "#FFB800",
    accentText: "#08142B",
    border: "#FFFFFF",
    dark: true,
  },
  {
    id: "mugshot",
    name: "Evidence File",
    bg: "#18181B",
    surface: "#242429",
    text: "#FAFAFA",
    muted: "#A1A1AA",
    accent: "#F97316",
    accentText: "#0B0B0B",
    border: "#52525B",
    dark: true,
  },
  {
    id: "cream_print",
    name: "Newspaper",
    bg: "#F5F0E6",
    surface: "#FFFFFF",
    text: "#111111",
    muted: "#57534E",
    accent: "#DC2626",
    accentText: "#FFFFFF",
    border: "#111111",
    dark: false,
  },
  {
    id: "vhs_crimson",
    name: "Red Tape",
    bg: "#1A0505",
    surface: "#290A0A",
    text: "#FFF1F2",
    muted: "#FDA4AF",
    accent: "#FFE600",
    accentText: "#0B0B0B",
    border: "#FF2E2E",
    dark: true,
  },
  {
    id: "court_doc",
    name: "Court Exhibit",
    bg: "#E5E7EB",
    surface: "#FFFFFF",
    text: "#111827",
    muted: "#4B5563",
    accent: "#1E3A8A",
    accentText: "#FFFFFF",
    border: "#111827",
    dark: false,
  },
  {
    id: "acid_raw",
    name: "Acid Poster",
    bg: "#0B0B0B",
    surface: "#141414",
    text: "#E8FF00",
    muted: "#A3B500",
    accent: "#FF2E2E",
    accentText: "#FFFFFF",
    border: "#E8FF00",
    dark: true,
  },
];

export const MEME_TEXTURES: MemeTextureId[] = [
  "clean",
  "halftone",
  "scanlines",
  "paper",
  "grid",
];

export const MEME_STAMPS: Array<{ id: MemeStampId; label: string }> = [
  { id: "caught_4k", label: "CAUGHT IN 4K" },
  { id: "broad_daylight", label: "BROAD DAYLIGHT" },
  { id: "no_recovery", label: "NO RECOVERY" },
  { id: "certified_l", label: "DOCUMENTED L" },
  { id: "none", label: "NO STAMP" },
];

export const MEME_FONTS: MemeFontStyle[] = [
  "brutal",
  "editorial",
  "terminal",
  "clean",
];

export function getPaletteById(id: string): MemePalette {
  return MEME_PALETTES.find((p) => p.id === id) || MEME_PALETTES[0];
}

export function getDefaultStyleForFormat(format: MemeFormatId): MemeStyleConfig {
  const num = String(100 + Math.floor(Math.random() * 899));
  switch (format) {
    case "viewfinder_4k":
      return {
        format,
        paletteId: "newsroom",
        texture: "scanlines",
        stamp: "caught_4k",
        fontStyle: "brutal",
        caseNumber: `CAM-${num}`,
      };
    case "breaking_tv":
      return {
        format,
        paletteId: "cobalt",
        texture: "clean",
        stamp: "none",
        fontStyle: "brutal",
        caseNumber: `LIVE-${num}`,
      };
    case "thermal_receipt":
      return {
        format,
        paletteId: "thermal",
        texture: "paper",
        stamp: "certified_l",
        fontStyle: "terminal",
        caseNumber: `INV-${num}`,
      };
    case "pr_apology":
      return {
        format,
        paletteId: "ios_dark",
        texture: "clean",
        stamp: "none",
        fontStyle: "editorial",
        caseNumber: `PR-${num}`,
      };
    case "search_leak":
      return {
        format,
        paletteId: "ios_dark",
        texture: "grid",
        stamp: "no_recovery",
        fontStyle: "clean",
        caseNumber: `LOG-${num}`,
      };
    case "group_poll":
      return {
        format,
        paletteId: "whatsapp_dark",
        texture: "clean",
        stamp: "none",
        fontStyle: "clean",
        caseNumber: `GC-${num}`,
      };
  }
}

export function remixStyle(current?: MemeStyleConfig, lockFormat = false): MemeStyleConfig {
  const pick = <T,>(arr: T[], avoid?: T): T => {
    const filtered = avoid !== undefined ? arr.filter((x) => x !== avoid) : arr;
    return filtered[Math.floor(Math.random() * filtered.length)] || arr[0];
  };

  const format = lockFormat && current
    ? current.format
    : pick(MEME_FORMATS.map((f) => f.id), current?.format);

  // Pick format-friendly palettes most of the time so it stays crisp and readable
  const palettePool =
    format === "thermal_receipt"
      ? ["thermal", "cream_print", "court_doc", "tabloid"]
      : format === "group_poll"
      ? ["whatsapp_dark", "ios_dark", "newsroom", "cobalt"]
      : MEME_PALETTES.map((p) => p.id);

  const paletteId = pick(palettePool, current?.paletteId);
  const texture = pick(MEME_TEXTURES, current?.texture);
  const stamp = pick(
    MEME_STAMPS.map((s) => s.id),
    current?.stamp
  );
  const fontStyle = pick(MEME_FONTS, current?.fontStyle);
  const caseNumber = `${format.slice(0, 3).toUpperCase()}-${100 + Math.floor(Math.random() * 899)}`;

  return { format, paletteId, texture, stamp, fontStyle, caseNumber };
}

export function getStarterContent(name = "Rohan"): MemeContent {
  const n = name.trim() || "Rohan";
  return {
    name: n,
    headline: `${n} caught lying in broad daylight — said "bas 5 min mein pahunch raha hoon" while still in a towel`,
    subline: "Location pin literally hasn't moved since 6:40 PM.",
    saidText: `"Bro I'm literally downstairs, parking the scooty."`,
    realityText: `Just woke up. Hasn't even brushed yet.`,
    tickerText: `UPDATES: ${n.toUpperCase()} STILL HASN'T RETURNED ₹500 FROM MARCH  •  GROUP CHAT VOTES TO LEAVE WITHOUT THEM  •  PHONE SUDDENLY ON 2%`,
    items: [
      `Borrowed ₹500 in March (Amnesia)`,
      `"Phone was on silent" x6`,
      `Cancelled Goa plan 2 hrs before train`,
      `Read msg at 11:02, replied next Tuesday`,
    ],
    totalLabel: `TOTAL: ZERO SHAME`,
    apologyBody: `After taking time to reflect on last night's 2:14 AM text to my ex, I want to clarify that I was not hacked. I simply have zero self-respect and poor Wi-Fi judgment. I ask the group chat for privacy while I ignore everyone's advice again next weekend.`,
  };
}
// src/components/CreatorStudio.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Check,
  Copy,
  Dices,
  ExternalLink,
  Flame,
  Gift,
  Lock,
  MessageCircle,
  Newspaper,
  Share2,
  Skull,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  History,
  Trash2,
} from "lucide-react";
import {
  BaitMode,
  HEADLINE_PRESETS,
  HeadlineCategory,
  LangMode,
  SpiceMode,
  buildBaitPath,
  generateInfiniteBait,
} from "@/lib/prankEngine";
import { soundFX } from "@/lib/soundEngine";

interface CreatorStudioProps {
  initialChain?: number;
  initialSender?: string;
}

interface SavedTrap {
  id: string;
  victim: string;
  headline: string;
  url: string;
  mode: BaitMode;
}

const CHAT_BAIT_CAPTIONS: Record<"hi" | "en", string[]> = {
  hi: [
    "bhai yeh kya scene hai?? jaldi dekh delete hone se pehle 💀",
    "arre bro yeh tere baare mein kyun ghoom raha hai group mein 👀",
    "bhai 2nd paragraph padh iska, dimaag hil jayega 😭",
    "kisi ne abhi forward kiya, jaldi khol le before it expires",
  ],
  en: [
    "bro wtf is this?? open before it gets taken down 💀",
    "wait why is everyone sending this around rn 👀",
    "nah read the second half of this 😭",
    "someone just dropped this in the chat, thought you should see first",
  ],
};

const QUICK_NAMES = ["Rohan", "Priya", "Kabir", "Aarav", "Ananya", "Dev"];
const HISTORY_KEY = "dispatch_recent_traps_v1";

export default function CreatorStudio({
  initialChain = 1,
  initialSender = "",
}: CreatorStudioProps) {
  const [origin, setOrigin] = useState("https://daily-dispatch.live");
  const [victimName, setVictimName] = useState("");
  const [senderName, setSenderName] = useState(initialSender);
  const [mode, setMode] = useState<BaitMode>("news");
  const [lang, setLang] = useState<LangMode>("mix");
  const [spice, setSpice] = useState<SpiceMode>("chaotic");

  const [headlineDraft, setHeadlineDraft] = useState(
    HEADLINE_PRESETS[0].template
  );
  const [subheadDraft, setSubheadDraft] = useState(HEADLINE_PRESETS[0].subhead);
  const [tagDraft, setTagDraft] = useState(HEADLINE_PRESETS[0].tag);
  const [seed, setSeed] = useState(4041);
  const [rollCount, setRollCount] = useState(0);

  const [activeCategory, setActiveCategory] =
    useState<HeadlineCategory>("hinglish");
  const [captionIndex, setCaptionIndex] = useState(0);

  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);
  const [recentTraps, setRecentTraps] = useState<SavedTrap[]>([]);

  // Hydrate origin, recent traps, and roll a guaranteed fresh headline on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setRecentTraps(parsed);
        }
      } catch {}
    }

    const fresh = generateInfiniteBait({
      name: "{name}",
      mode: "news",
      lang: "mix",
      spice: "chaotic",
    });
    setHeadlineDraft(fresh.headline);
    setSubheadDraft(fresh.subhead);
    setTagDraft(fresh.tag);
    setSeed(Math.floor(Math.random() * 999999));
  }, []);

  const displayVictim = victimName.trim() || "Rohan";

  const resolvedHeadline = useMemo(() => {
    const raw = headlineDraft.trim();
    if (!raw) return `BREAKING: ${displayVictim} caught in 4K`;
    if (raw.includes("{name}")) return raw.replaceAll("{name}", displayVictim);
    if (raw.toLowerCase().includes(displayVictim.toLowerCase())) return raw;
    return `${tagDraft || "BREAKING"}: ${displayVictim} — ${raw}`;
  }, [headlineDraft, displayVictim, tagDraft]);

  const baitPath = useMemo(() => {
    return buildBaitPath({
      name: displayVictim,
      customHeadline: resolvedHeadline,
      customSubhead: subheadDraft,
      customTag: tagDraft,
      mode,
      lang,
      spice,
      sender: senderName.trim() || undefined,
      chain: initialChain,
      seed,
    });
  }, [
    displayVictim,
    resolvedHeadline,
    subheadDraft,
    tagDraft,
    mode,
    lang,
    spice,
    senderName,
    initialChain,
    seed,
  ]);

  const fullUrl = `${origin}${baitPath}`;

  const activeCaptions =
    lang === "en" ? CHAT_BAIT_CAPTIONS.en : CHAT_BAIT_CAPTIONS.hi;
  const activeCaption = activeCaptions[captionIndex % activeCaptions.length];

  const rollFreshHeadline = (
    overrideMode?: BaitMode,
    overrideLang?: LangMode,
    overrideSpice?: SpiceMode
  ) => {
    const nextM = overrideMode ?? mode;
    const nextL = overrideLang ?? lang;
    const nextS = overrideSpice ?? spice;

    const gen = generateInfiniteBait({
      name: "{name}",
      mode: nextM,
      lang: nextL,
      spice: nextS,
    });

    setHeadlineDraft(gen.headline);
    setSubheadDraft(gen.subhead);
    setTagDraft(gen.tag);
    setSeed(Math.floor(Math.random() * 999999));
    setRollCount((c) => c + 1);
    setCopied(false);
  };

  const saveTrapToHistory = () => {
    const entry: SavedTrap = {
      id: `${Date.now()}`,
      victim: displayVictim,
      headline: resolvedHeadline,
      url: fullUrl,
      mode,
    };
    setRecentTraps((prev) => {
      const next = [entry, ...prev.filter((item) => item.url !== fullUrl)].slice(
        0,
        5
      );
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleCopyLink = async (customUrl?: string) => {
    const targetUrl = customUrl || fullUrl;
    try {
      await navigator.clipboard.writeText(targetUrl);
      soundFX.playCopySuccess();
      if (!customUrl) {
        saveTrapToHistory();
        setCopied(true);
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.72 },
          colors: ["#FF2E2E", "#FFE600", "#0B0B0B", "#FFFFFF"],
        });
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      window.prompt("Copy your bait link:", targetUrl);
    }
  };

  const handleWhatsappDrop = () => {
    soundFX.playClick();
    saveTrapToHistory();
    const message = `${activeCaption}\n${fullUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleNativeShare = async () => {
    soundFX.playClick();
    saveTrapToHistory();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: resolvedHeadline,
          text: activeCaption,
          url: fullUrl,
        });
        return;
      } catch {
        // Fall back to copy
      }
    }
    handleCopyLink();
  };

  const handleClearHistory = () => {
    soundFX.playClick();
    setRecentTraps([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.muted = next;
  };

  const filteredPresets = useMemo(
    () => HEADLINE_PRESETS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  const previewDark = mode === "leak" || spice === "dark";
  const previewGift = mode === "gift";

  return (
    <div className="min-h-screen w-full halftone-bg text-[#0B0B0B] flex flex-col">
      {/* Top Breaking Ticker Marquee */}
      <div className="w-full bg-[#0B0B0B] text-[#FFE600] border-b-[3px] border-[#0B0B0B] overflow-hidden py-2">
        <div className="animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center gap-8 pr-8">
              <span>● CAUGHT IN 4K</span>
              <span className="text-white">FAKE NEWS • MYSTERY BOX • LEAKED CCTV</span>
              <span className="text-[#FF2E2E]">● HINGLISH + EN + DARK TURNS</span>
              <span>● REAL WHATSAPP & IG LINK THUMBNAIL</span>
              <span className="text-white">● ZERO REPEATS</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="brutal-box-sm bg-[#FF2E2E] text-white px-3 py-1 font-display text-2xl sm:text-3xl tracking-wider leading-none -rotate-2">
            DISPATCH
          </div>
          <div className="hidden sm:block font-mono text-[11px] font-bold uppercase text-neutral-600 leading-tight">
            <div>BAIT LINK MACHINE</div>
            <div className="text-[#0B0B0B]">GROUP CHAT EDITION</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {initialChain > 1 && (
            <div className="brutal-box-sm bg-[#FFE600] px-3 py-1.5 font-mono text-xs font-bold uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF2E2E]" />
              CHAIN #{initialChain}
            </div>
          )}
          <button
            type="button"
            onClick={toggleMute}
            className="brutal-box-sm brutal-press bg-white p-2 cursor-pointer"
            title={muted ? "Unmute Sound FX" : "Mute Sound FX"}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-[#FF2E2E]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#0B0B0B]" />
            )}
          </button>
        </div>
      </header>

      {/* Main 2-Column Studio */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: BUILDER CONTROLS */}
        <section className="lg:col-span-7 space-y-5">
          {/* Step 1: Victim & Sender */}
          <div className="brutal-box-lg bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#0B0B0B] text-[#FFE600] font-mono text-[11px] font-bold px-2.5 py-0.5 uppercase">
                01 // TARGET
              </span>
              <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase">
                WHO'S GETTING COOKED?
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-1.5">
                  FRIEND'S NAME *
                </label>
                <input
                  type="text"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  placeholder="Type name (e.g. Rohan)"
                  maxLength={28}
                  className="w-full brutal-box-sm bg-[#FAF7F0] px-4 py-3 font-sans font-extrabold text-lg text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFF8C5]"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase mb-1.5">
                  YOUR NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Blank = Anonymous"
                  maxLength={24}
                  className="w-full brutal-box-sm bg-[#FAF7F0] px-4 py-3 font-sans font-bold text-lg text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFF8C5]"
                />
              </div>
            </div>

            {/* Quick Tap Names */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="font-mono text-[10px] font-bold uppercase text-neutral-500 mr-1">
                QUICK:
              </span>
              {QUICK_NAMES.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setVictimName(n);
                  }}
                  className="border-2 border-[#0B0B0B] bg-[#FAF7F0] hover:bg-[#FFE600] px-2.5 py-0.5 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Disguise + Language + Dark Switch */}
          <div className="brutal-box-lg bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="bg-[#0B0B0B] text-[#FFE600] font-mono text-[11px] font-bold px-2.5 py-0.5 uppercase">
                02 // DISGUISE & VIBE
              </span>
              <span className="font-mono text-[11px] font-bold text-neutral-500 uppercase">
                CHANGES LINK PREVIEW TOO
              </span>
            </div>

            {/* Disguise Modes */}
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  {
                    id: "news",
                    label: "BREAKING NEWS",
                    sub: "/news/...",
                    icon: Newspaper,
                    activeBg: "bg-[#FF2E2E] text-white",
                  },
                  {
                    id: "gift",
                    label: "MYSTERY GIFT",
                    sub: "/gift/...",
                    icon: Gift,
                    activeBg: "bg-[#FFE600] text-[#0B0B0B]",
                  },
                  {
                    id: "leak",
                    label: "CCTV / LEAK",
                    sub: "/leak/...",
                    icon: Lock,
                    activeBg: "bg-[#0B0B0B] text-[#FFE600]",
                  },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setMode(m.id);
                      rollFreshHeadline(m.id, lang, spice);
                    }}
                    className={`brutal-box-sm brutal-press p-3 text-left cursor-pointer transition-colors ${
                      active ? m.activeBg : "bg-[#FAF7F0] hover:bg-neutral-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <div className="font-display text-base sm:text-lg tracking-wide leading-none">
                      {m.label}
                    </div>
                    <div className="font-mono text-[10px] opacity-75 mt-1">
                      {m.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Language + Dark Turn Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t-2 border-dashed border-neutral-300">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "mix", label: "MIX (HI + EN)" },
                    { id: "hi", label: "HINGLISH" },
                    { id: "en", label: "ENGLISH" },
                  ] as const
                ).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setLang(l.id);
                      rollFreshHeadline(mode, l.id, spice);
                    }}
                    className={`border-2 border-[#0B0B0B] px-3 py-1.5 font-mono text-xs font-bold cursor-pointer transition-colors ${
                      lang === l.id
                        ? "bg-[#0B0B0B] text-[#FFE600]"
                        : "bg-white text-[#0B0B0B] hover:bg-neutral-100"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextSpice: SpiceMode =
                    spice === "dark" ? "chaotic" : "dark";
                  soundFX.playDiceTick();
                  setSpice(nextSpice);
                  rollFreshHeadline(mode, lang, nextSpice);
                }}
                className={`brutal-box-sm brutal-press px-3.5 py-1.5 font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
                  spice === "dark"
                    ? "bg-[#FF2E2E] text-white"
                    : "bg-[#FAF7F0] text-[#0B0B0B] hover:bg-[#0B0B0B] hover:text-white"
                }`}
              >
                <Skull className="w-4 h-4" />
                {spice === "dark" ? "DARK TURN: ON" : "DARK TURN: OFF"}
              </button>
            </div>
          </div>

          {/* Step 3: Infinite Headline Roller + Custom Edit */}
          <div className="brutal-box-lg bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="bg-[#0B0B0B] text-[#FFE600] font-mono text-[11px] font-bold px-2.5 py-0.5 uppercase">
                03 // HEADLINE BAIT
              </span>

              <button
                type="button"
                onClick={() => {
                  soundFX.playDiceTick();
                  rollFreshHeadline();
                }}
                className="brutal-box-sm brutal-press bg-[#FFE600] hover:bg-[#FF2E2E] hover:text-white px-4 py-2 font-display text-lg tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Dices className="w-5 h-5" />
                ROLL FRESH BAIT
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={rollCount}
                initial={{ opacity: 0.6, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
              >
                <textarea
                  rows={3}
                  value={resolvedHeadline}
                  onChange={(e) => setHeadlineDraft(e.target.value)}
                  placeholder="Write your own crazy headline or hit Roll Fresh Bait..."
                  className="w-full brutal-box-sm bg-[#FAF7F0] p-3.5 font-serif font-bold text-lg sm:text-xl leading-snug text-[#0B0B0B] focus:outline-none focus:bg-[#FFF9D6] resize-none"
                />
              </motion.div>
            </AnimatePresence>

            {/* Quick Category Presets */}
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: "hinglish", label: "HINGLISH" },
                    { id: "dark", label: "DARK" },
                    { id: "exposed", label: "EXPOSED" },
                    { id: "unhinged", label: "UNHINGED" },
                    { id: "gift", label: "GIFT" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setActiveCategory(cat.id);
                    }}
                    className={`border-2 border-[#0B0B0B] px-2.5 py-1 font-mono text-[10px] font-bold uppercase cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-[#0B0B0B] text-white"
                        : "bg-[#FAF7F0] text-[#0B0B0B] hover:bg-[#FFE600]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filteredPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setHeadlineDraft(preset.template);
                      setSubheadDraft(preset.subhead);
                      setTagDraft(preset.tag);
                      setMode(preset.mode);
                      setSpice(preset.dark ? "dark" : "chaotic");
                      setSeed(Math.floor(Math.random() * 999999));
                      setCopied(false);
                    }}
                    className="w-full text-left border-2 border-[#0B0B0B] bg-[#FAF7F0] hover:bg-[#FFE600] p-2.5 transition-colors cursor-pointer flex items-start justify-between gap-2"
                  >
                    <span className="font-sans font-bold text-xs sm:text-sm leading-snug">
                      {preset.template.replaceAll("{name}", displayVictim)}
                    </span>
                    <span className="font-mono text-[9px] font-bold uppercase bg-[#0B0B0B] text-white px-1.5 py-0.5 flex-shrink-0">
                      {preset.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LIVE WHATSAPP PREVIEW + DROP CONTROLS */}
        <aside className="lg:col-span-5 lg:sticky lg:top-6 space-y-5">
          {/* Live Chat Preview Box */}
          <div className="brutal-box-lg bg-[#0B141A] text-white p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#00C853] text-[#0B0B0B] font-mono text-xs font-extrabold flex items-center justify-center">
                  GC
                </div>
                <div>
                  <div className="font-sans font-bold text-xs leading-none">
                    Group Chat Preview
                  </div>
                  <div className="font-mono text-[10px] text-[#00E676] mt-0.5">
                    live link card • updates as you type
                  </div>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 uppercase">
                {mode}
              </span>
            </div>

            {/* Simulated Sent WhatsApp Message Bubble */}
            <div className="ml-auto max-w-[95%] bg-[#005C4B] rounded-lg rounded-tr-none p-2 space-y-2 shadow-lg">
              {/* Embedded OG Thumbnail Card */}
              <div
                className={`rounded overflow-hidden border-2 ${
                  previewDark
                    ? "bg-[#0B0B0B] text-white border-[#FF2E2E]"
                    : previewGift
                    ? "bg-[#FFE600] text-[#0B0B0B] border-[#0B0B0B]"
                    : "bg-[#FAF7F0] text-[#0B0B0B] border-[#0B0B0B]"
                }`}
              >
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[9px] font-extrabold px-1.5 py-0.5 uppercase ${
                        previewGift
                          ? "bg-[#0B0B0B] text-[#FFE600]"
                          : "bg-[#FF2E2E] text-white"
                      }`}
                    >
                      {tagDraft || "BREAKING"}
                    </span>
                    <span
                      className={`font-mono text-[9px] font-bold ${
                        previewDark ? "text-[#FFE600]" : "text-[#FF2E2E]"
                      }`}
                    >
                      {previewGift ? `FOR: ${displayVictim.toUpperCase()}` : "● LIVE"}
                    </span>
                  </div>

                  <div className="font-serif font-extrabold text-base leading-tight">
                    {resolvedHeadline}
                  </div>

                  <div className="font-sans text-[11px] opacity-75 line-clamp-2">
                    {subheadDraft}
                  </div>
                </div>

                <div
                  className={`px-3 py-1.5 font-mono text-[10px] flex items-center justify-between ${
                    previewDark
                      ? "bg-[#1A1A1A] text-neutral-300"
                      : "bg-black/10 text-[#0B0B0B]"
                  }`}
                >
                  <span className="truncate">
                    {origin.replace(/^https?:\/\//, "")}/{mode}/...
                  </span>
                  <span className="font-bold ml-2">OPEN →</span>
                </div>
              </div>

              {/* Caption Text + Fake URL */}
              <div className="px-1.5 pb-1 space-y-1">
                <p className="font-sans text-xs text-white leading-snug">
                  {activeCaption}
                </p>
                <p className="font-mono text-[10px] text-[#53BDEB] break-all line-clamp-1 underline">
                  {fullUrl}
                </p>
                <div className="text-right font-mono text-[9px] text-white/60">
                  now ✓✓
                </div>
              </div>
            </div>

            {/* Swap Chat Caption */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="font-mono text-[10px] text-white/60 uppercase">
                BAIT TEXT ABOVE LINK:
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playClick();
                  setCaptionIndex((i) => i + 1);
                }}
                className="font-mono text-[10px] font-bold uppercase text-[#FFE600] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> SWAP CAPTION
              </button>
            </div>
          </div>

          {/* Launchpad Buttons */}
          <div className="brutal-box-lg bg-[#FFE600] p-5 space-y-3">
            <button
              type="button"
              onClick={handleWhatsappDrop}
              className="w-full brutal-box brutal-press animate-pulse-cta bg-[#00C853] text-[#0B0B0B] py-4 px-5 font-display text-2xl sm:text-3xl tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <MessageCircle className="w-6 h-6" />
              DROP IN WHATSAPP
            </button>

            <button
              type="button"
              onClick={() => handleCopyLink()}
              className="w-full brutal-box brutal-press bg-[#0B0B0B] text-[#FFE600] py-3.5 px-5 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6 text-[#00FF66]" /> COPIED! PASTE IN CHAT
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> COPY BAIT LINK
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleNativeShare}
                className="brutal-box-sm brutal-press bg-white text-[#0B0B0B] py-2.5 px-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> SHARE MORE
              </button>

              <a
                href={baitPath}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  soundFX.playClick();
                  saveTrapToHistory();
                }}
                className="brutal-box-sm brutal-press bg-white text-[#0B0B0B] py-2.5 px-3 font-mono text-xs font-bold uppercase flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> TEST TRAP
              </a>
            </div>
          </div>

          {/* Recent Links Built on This Device */}
          {recentTraps.length > 0 && (
            <div className="brutal-box bg-white p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> RECENT BAITS ({recentTraps.length})
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="font-mono text-[10px] font-bold uppercase text-neutral-500 hover:text-[#FF2E2E] flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> CLEAR
                </button>
              </div>
              <div className="space-y-1.5">
                {recentTraps.map((trap) => (
                  <div
                    key={trap.id}
                    className="border-2 border-[#0B0B0B] bg-[#FAF7F0] p-2 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-bold uppercase text-[#FF2E2E]">
                        {trap.victim} • {trap.mode}
                      </div>
                      <div className="font-sans text-xs font-bold truncate">
                        {trap.headline}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(trap.url)}
                      className="border-2 border-[#0B0B0B] bg-[#FFE600] hover:bg-[#0B0B0B] hover:text-white p-1.5 cursor-pointer flex-shrink-0"
                      title="Copy Link"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
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
  Skull,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  BaitMode,
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

const CHAT_CAPTIONS = {
  hi: [
    "bhai yeh kya scene hai?? jaldi dekh 💀",
    "bro yeh tere baare mein kyun ghoom raha hai 👀",
    "delete hone se pehle dekh le bhai",
  ],
  en: [
    "bro wtf is this?? open before it gets pulled 💀",
    "why is everyone sending this around rn 👀",
    "thought you should see this first",
  ],
};

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
    "LEAKED: {name} ki ChatGPT history mein 30 baar 'how to reply to hmm' search mila"
  );
  const [subheadDraft, setSubheadDraft] = useState(
    "Screenshots niche attached hain, link uddne se pehle dekh le."
  );
  const [tagDraft, setTagDraft] = useState("LEAKED");
  const [seed, setSeed] = useState(4041);
  const [rollCount, setRollCount] = useState(0);

  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
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
    if (!raw) return `LEAKED: ${displayVictim} caught in 4K`;
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

  const activeCaption = useMemo(() => {
    const pool = lang === "en" ? CHAT_CAPTIONS.en : CHAT_CAPTIONS.hi;
    return pool[seed % pool.length];
  }, [lang, seed]);

  const rollFresh = (
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      soundFX.playCopySuccess();
      setCopied(true);
      confetti({
        particleCount: 36,
        spread: 60,
        origin: { y: 0.72 },
        colors: ["#FF2E2E", "#FFE600", "#0B0B0B", "#FFFFFF"],
      });
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy your bait link:", fullUrl);
    }
  };

  const handleWhatsapp = () => {
    soundFX.playClick();
    const message = `${activeCaption}\n${fullUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.muted = next;
  };

  const previewDark = mode === "leak" || spice === "dark";
  const previewGift = mode === "gift";

  return (
    <div className="min-h-screen w-full halftone-bg text-[#0B0B0B]">
      {/* Simple Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="brutal-box-sm bg-[#FF2E2E] text-white px-3 py-1 font-display text-2xl sm:text-3xl tracking-wider leading-none -rotate-1">
            CAUGHT 4K
          </div>
          <p className="hidden sm:block text-sm font-semibold text-neutral-600">
            Make a fake link. Catch your friend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {initialChain > 1 && (
            <div className="brutal-box-sm bg-[#FFE600] px-3 py-1.5 font-mono text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF2E2E]" />
              Streak #{initialChain}
            </div>
          )}
          <button
            type="button"
            onClick={toggleMute}
            className="brutal-box-sm brutal-press bg-white p-2 cursor-pointer"
            aria-label={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-[#FF2E2E]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#0B0B0B]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Clean 2-Column Workspace */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: 2 SIMPLE CARDS */}
        <section className="lg:col-span-7 space-y-5">
          {/* Card 1: Name + Disguise */}
          <div className="brutal-box bg-white p-5 sm:p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                  Friend's Name
                </label>
                <input
                  type="text"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  placeholder="Rohan, Priya, Kabir..."
                  maxLength={28}
                  className="w-full brutal-box-sm bg-[#FAF7F0] px-4 py-3 font-sans font-bold text-lg text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFF9D6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                  Your Name <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Leave blank to stay anonymous"
                  maxLength={24}
                  className="w-full brutal-box-sm bg-[#FAF7F0] px-4 py-3 font-sans font-medium text-base text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFF9D6]"
                />
              </div>
            </div>

            {/* Disguise Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-2">
                Link Style
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(
                  [
                    { id: "news", label: "News Article", icon: Newspaper },
                    { id: "leak", label: "Leaked Clip", icon: Lock },
                    { id: "gift", label: "Secret Note", icon: Gift },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setMode(item.id);
                        rollFresh(item.id, lang, spice);
                      }}
                      className={`brutal-box-sm brutal-press py-3 px-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 font-sans font-bold text-xs sm:text-sm cursor-pointer transition-colors ${
                        active
                          ? "bg-[#0B0B0B] text-[#FFE600]"
                          : "bg-[#FAF7F0] text-[#0B0B0B] hover:bg-[#FFF5B8]"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Headline + Shuffle */}
          <div className="brutal-box bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: "mix", label: "Mix" },
                    { id: "hi", label: "Hinglish" },
                    { id: "en", label: "English" },
                  ] as const
                ).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setLang(l.id);
                      rollFresh(mode, l.id, spice);
                    }}
                    className={`border-2 border-[#0B0B0B] px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                      lang === l.id
                        ? "bg-[#0B0B0B] text-white"
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
                  const nextSpice: SpiceMode = spice === "dark" ? "chaotic" : "dark";
                  soundFX.playDiceTick();
                  setSpice(nextSpice);
                  rollFresh(mode, lang, nextSpice);
                }}
                className={`border-2 border-[#0B0B0B] px-3 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  spice === "dark"
                    ? "bg-[#FF2E2E] text-white"
                    : "bg-[#FAF7F0] text-[#0B0B0B] hover:bg-neutral-200"
                }`}
              >
                <Skull className="w-3.5 h-3.5" />
                {spice === "dark" ? "Brutal: ON" : "Brutal Mode"}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={rollCount}
                initial={{ opacity: 0.65, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.14 }}
              >
                <textarea
                  rows={3}
                  value={resolvedHeadline}
                  onChange={(e) => setHeadlineDraft(e.target.value)}
                  placeholder="Edit headline or hit Shuffle..."
                  className="w-full brutal-box-sm bg-[#FAF7F0] p-4 font-serif font-bold text-lg sm:text-xl leading-snug text-[#0B0B0B] focus:outline-none focus:bg-[#FFF9D6] resize-none"
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-500 font-medium">
                Tap inside to write your own, or shuffle a fresh one.
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playDiceTick();
                  rollFresh();
                }}
                className="brutal-box-sm brutal-press bg-[#FFE600] hover:bg-[#FF2E2E] hover:text-white px-4 py-2 font-sans font-extrabold text-sm flex items-center gap-2 cursor-pointer transition-colors flex-shrink-0"
              >
                <Dices className="w-4 h-4" />
                Shuffle
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: LIVE PREVIEW + SEND BUTTONS */}
        <aside className="lg:col-span-5 lg:sticky lg:top-6 space-y-5">
          {/* WhatsApp / DM Link Preview */}
          <div className="brutal-box bg-[#0B141A] text-white p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-semibold text-white">How it looks in chat</span>
              <span className="font-mono text-[11px] text-[#00E676]">Live preview</span>
            </div>

            <div className="bg-[#005C4B] rounded-lg p-2 space-y-2">
              <div
                className={`rounded overflow-hidden border-2 ${
                  previewDark
                    ? "bg-[#0B0B0B] text-white border-[#FF2E2E]"
                    : previewGift
                    ? "bg-[#FFE600] text-[#0B0B0B] border-[#0B0B0B]"
                    : "bg-[#FAF7F0] text-[#0B0B0B] border-[#0B0B0B]"
                }`}
              >
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 uppercase ${
                        previewGift
                          ? "bg-[#0B0B0B] text-[#FFE600]"
                          : "bg-[#FF2E2E] text-white"
                      }`}
                    >
                      {tagDraft}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        previewDark ? "text-[#FFE600]" : "text-[#FF2E2E]"
                      }`}
                    >
                      {previewGift ? `FOR ${displayVictim.toUpperCase()}` : "● LIVE"}
                    </span>
                  </div>

                  <div className="font-serif font-extrabold text-base leading-snug">
                    {resolvedHeadline}
                  </div>
                  <p className="text-xs opacity-75 line-clamp-2">{subheadDraft}</p>
                </div>

                <div
                  className={`px-3.5 py-1.5 font-mono text-[10px] flex items-center justify-between ${
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

              <div className="px-1.5 pb-0.5">
                <p className="text-xs text-white leading-snug">{activeCaption}</p>
                <div className="text-right font-mono text-[10px] text-white/60 mt-1">
                  now ✓✓
                </div>
              </div>
            </div>
          </div>

          {/* Primary Actions */}
          <div className="brutal-box bg-[#FFE600] p-4 sm:p-5 space-y-3">
            <button
              type="button"
              onClick={handleWhatsapp}
              className="w-full brutal-box brutal-press bg-[#00C853] text-[#0B0B0B] py-3.5 px-4 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-6 h-6" />
              Send on WhatsApp
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full brutal-box brutal-press bg-[#0B0B0B] text-[#FFE600] py-3.5 px-4 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-[#00FF66]" /> Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Copy Bait Link
                </>
              )}
            </button>

            <a
              href={baitPath}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundFX.playClick()}
              className="w-full py-2 text-center font-sans text-xs font-bold underline underline-offset-4 text-[#0B0B0B] hover:text-[#FF2E2E] flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview what they'll see
            </a>
          </div>
        </aside>
      </main>
    </div>
  );
}
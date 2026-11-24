// src/components/PrankTrapClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  Copy,
  Dices,
  Eye,
  Gift,
  Lock,
  MessageCircle,
  Play,
  Share2,
  ShieldAlert,
  Skull,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  BaitMode,
  BaitPayload,
  LangMode,
  SpiceMode,
  buildBaitPath,
  formatHeadline,
  generateInfiniteBait,
  getDecoyComments,
  getGullibilityVerdict,
  getPresetMeta,
} from "@/lib/prankEngine";
import { soundFX } from "@/lib/soundEngine";
import { shareOrDownloadStoryCard } from "@/lib/storyCard";

interface Props {
  payload: BaitPayload;
}

export default function PrankTrapClient({ payload }: Props) {
  const headline = useMemo(() => formatHeadline(payload), [payload]);
  const meta = useMemo(() => getPresetMeta(payload), [payload]);
  const decoyComments = useMemo(
    () =>
      getDecoyComments(
        payload.name,
        payload.mode,
        payload.lang || "mix",
        payload.seed || 1337
      ),
    [payload.name, payload.mode, payload.lang, payload.seed]
  );

  const mountedAtRef = useRef<number>(0);
  const [sprung, setSprung] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reactionSeconds, setReactionSeconds] = useState(2.3);
  const [verdict, setVerdict] = useState({
    title: "CAUGHT IN 4K",
    percent: 96,
    roast: "Clicked without a single critical thought.",
  });

  const [countdown, setCountdown] = useState(payload.mode === "gift" ? 485 : 178);
  const [liveReaders, setLiveReaders] = useState(
    9400 + ((payload.seed || 421) % 3800)
  );
  const [storyStatus, setStoryStatus] = useState<"idle" | "busy" | "done">("idle");

  // Clean Inline Revenge Box
  const [nextVictim, setNextVictim] = useState("");
  const [nextLang, setNextLang] = useState<LangMode>(payload.lang || "mix");
  const [nextSpice, setNextSpice] = useState<SpiceMode>(payload.spice || "chaotic");
  const [nextMode] = useState<BaitMode>(payload.mode);
  const [rolledBait, setRolledBait] = useState<{
    headline: string;
    subhead: string;
    tag: string;
  } | null>(null);
  const [customInput, setCustomInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [revengeSeed, setRevengeSeed] = useState(1001);

  useEffect(() => {
    mountedAtRef.current = performance.now();
    setRevengeSeed(Math.floor(Math.random() * 999999));

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 10 ? prev - 1 : 59));
      setLiveReaders((prev) => prev + Math.floor(Math.random() * 7) - 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const rollFreshRevenge = (overrideLang?: LangMode, overrideSpice?: SpiceMode) => {
    const l = overrideLang ?? nextLang;
    const s = overrideSpice ?? nextSpice;
    const gen = generateInfiniteBait({
      name: "{name}",
      mode: nextMode,
      lang: l,
      spice: s,
    });
    setRolledBait({ headline: gen.headline, subhead: gen.subhead, tag: gen.tag });
    setCustomInput(gen.headline);
    setRevengeSeed(Math.floor(Math.random() * 999999));
    setCopied(false);
  };

  const triggerTrap = () => {
    if (sprung) return;

    const elapsed = Math.max(
      0.4,
      (performance.now() - (mountedAtRef.current || performance.now() - 2100)) / 1000
    );
    const rounded = Math.round(elapsed * 10) / 10;
    setReactionSeconds(rounded);
    setVerdict(
      getGullibilityVerdict(rounded, payload.lang || "mix", payload.spice || "chaotic")
    );

    soundFX.muted = muted;
    soundFX.playCaught4K();

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([120, 40, 220, 40, 120]);
      } catch {}
    }

    setFlashActive(true);
    setShaking(true);
    setSprung(true);
    rollFreshRevenge();

    setTimeout(() => setFlashActive(false), 850);
    setTimeout(() => setShaking(false), 520);

    confetti({
      particleCount: 90,
      spread: 85,
      origin: { y: 0.52 },
      colors: ["#FF2E2E", "#FFE600", "#FFFFFF", "#0B0B0B"],
    });
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.muted = next;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const revengeUrl = useMemo(() => {
    const cleanVictim = nextVictim.trim() || "Rohan";
    const finalHeadline = (
      customInput ||
      rolledBait?.headline ||
      "LEAKED: {name} caught in 4K"
    ).replaceAll("{name}", cleanVictim);

    const path = buildBaitPath({
      name: cleanVictim,
      customHeadline: finalHeadline,
      customSubhead: rolledBait?.subhead,
      customTag: rolledBait?.tag,
      mode: nextMode,
      lang: nextLang,
      spice: nextSpice,
      sender: payload.name || undefined,
      chain: (payload.chain || 1) + 1,
      seed: revengeSeed,
    });

    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [
    nextVictim,
    customInput,
    rolledBait,
    nextMode,
    nextLang,
    nextSpice,
    payload.name,
    payload.chain,
    revengeSeed,
  ]);

  const handleCopyRevenge = async () => {
    try {
      await navigator.clipboard.writeText(revengeUrl);
      soundFX.playCopySuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy your bait link:", revengeUrl);
    }
  };

  const handleWhatsappRevenge = () => {
    soundFX.playClick();
    const caption =
      nextLang === "en"
        ? "bro wtf is this?? open before it gets pulled 💀"
        : "bhai yeh kya scene hai?? jaldi dekh 💀";
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${caption}\n${revengeUrl}`)}`,
      "_blank"
    );
  };

  const handleShareStory = async () => {
    soundFX.playClick();
    setStoryStatus("busy");
    const host =
      typeof window !== "undefined" ? window.location.host : "caught4k.app";
    const outcome = await shareOrDownloadStoryCard({
      victimName: payload.name,
      headline,
      reactionSeconds,
      gullibilityPercent: verdict.percent,
      verdictTitle: verdict.title,
      chainCount: payload.chain || 1,
      senderName: payload.sender,
      siteHost: host,
    });
    setStoryStatus(outcome === "failed" ? "idle" : "done");
    if (outcome !== "failed") {
      soundFX.playCopySuccess();
      setTimeout(() => setStoryStatus("idle"), 2600);
    }
  };

  // ==========================================================================
  // PHASE 1: DECOY SCREENS
  // ==========================================================================
  if (!sprung) {
    if (payload.mode === "gift") {
      return (
        <main className="min-h-screen w-full halftone-bg flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-4">
            <div className="brutal-box-sm bg-[#0B0B0B] text-[#FFE600] px-4 py-2 flex items-center justify-between font-mono text-xs font-bold">
              <span>{meta.tag}</span>
              <span className="flex items-center gap-1.5 text-white">
                <Clock className="w-3.5 h-3.5 text-[#FFE600]" />
                {formatTimer(countdown)}
              </span>
            </div>

            <div className="brutal-box-lg bg-[#FFE600] p-6 text-center space-y-5">
              <div className="inline-block bg-[#0B0B0B] text-white font-mono text-xs font-bold px-3 py-1 uppercase">
                For: {payload.name}
              </div>

              <button
                type="button"
                onClick={triggerTrap}
                className="w-32 h-32 mx-auto bg-[#FAF7F0] brutal-box flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
              >
                <Gift className="w-14 h-14 text-[#FF2E2E]" strokeWidth={2.2} />
                <span className="font-mono text-[10px] font-bold bg-[#0B0B0B] text-[#FFE600] px-2 py-0.5">
                  SEALED
                </span>
              </button>

              <h1 className="font-sans text-2xl font-extrabold leading-tight text-[#0B0B0B]">
                {headline}
              </h1>
              <p className="text-sm text-[#0B0B0B]/80">{meta.subhead}</p>

              <button
                type="button"
                onClick={triggerTrap}
                className="w-full brutal-box brutal-press animate-pulse-cta bg-[#0B0B0B] text-[#FFE600] py-4 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" /> Tap to Open
              </button>
            </div>
          </div>
        </main>
      );
    }

    if (payload.mode === "leak") {
      return (
        <main className="min-h-screen w-full halftone-dark text-[#FAF7F0] flex items-center justify-center p-4">
          <div className="w-full max-w-lg space-y-4">
            <div className="border-2 border-[#FF2E2E] bg-[#160A0A] px-4 py-2 flex items-center justify-between font-mono text-xs">
              <span className="text-[#FF2E2E] font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                {meta.tag}
              </span>
              <span className="text-[#FFE600] font-bold">
                Expires {formatTimer(countdown)}
              </span>
            </div>

            <div className="border-[3px] border-white bg-[#121212] p-5 sm:p-6 shadow-[6px_6px_0px_#FF2E2E] space-y-4">
              <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#FF2E2E]" />
                  {liveReaders.toLocaleString()} viewing
                </span>
                <span>{payload.name.toUpperCase()}_LOG.MP4</span>
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                {headline}
              </h1>
              <p className="text-sm text-neutral-300">{meta.subhead}</p>

              <div
                onClick={triggerTrap}
                className="relative w-full aspect-video bg-[#080808] border-2 border-neutral-700 overflow-hidden cursor-pointer group flex flex-col items-center justify-center"
              >
                <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-30 blur-[5px] pointer-events-none">
                  <div className="h-4 w-3/4 bg-neutral-500 rounded" />
                  <div className="h-24 w-full bg-gradient-to-tr from-neutral-800 via-red-900/50 to-neutral-700" />
                  <div className="h-3 w-2/3 bg-neutral-600 rounded" />
                </div>

                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-[#FF2E2E] border-[3px] border-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  <span className="font-mono text-xs font-bold bg-black/90 text-[#FFE600] px-3 py-1">
                    TAP TO UNBLUR
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerTrap}
                className="w-full bg-[#FF2E2E] text-white border-[3px] border-white py-3.5 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#FFE600]"
              >
                <Lock className="w-5 h-5" /> View Full Leak
              </button>
            </div>
          </div>
        </main>
      );
    }

    // Default: News Article Decoy
    return (
      <main className="min-h-screen w-full bg-[#FAF7F0] text-[#0B0B0B]">
        <header className="border-b-[3px] border-[#0B0B0B] bg-white sticky top-0 z-20">
          <div className="bg-[#FF2E2E] text-white text-[11px] font-mono font-bold py-1.5 px-4 flex items-center justify-between">
            <span>● {meta.tag}</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {liveReaders.toLocaleString()} live
            </span>
          </div>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-serif font-extrabold text-2xl sm:text-3xl tracking-tight">
              The Daily Dispatch
            </div>
            <div className="font-mono text-[10px] uppercase text-neutral-500">
              Updated 2m ago
            </div>
          </div>
        </header>

        <article className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold leading-[1.12] tracking-tight">
            {headline}
          </h1>

          <p className="font-serif text-lg text-neutral-700 leading-snug border-l-4 border-[#FF2E2E] pl-4">
            {meta.subhead}
          </p>

          <div
            onClick={triggerTrap}
            className="relative brutal-box bg-[#141414] aspect-[16/10] overflow-hidden cursor-pointer group flex items-center justify-center p-4 text-center"
          >
            <div className="absolute inset-0 opacity-30 blur-md bg-[radial-gradient(circle_at_30%_30%,#ff2e2e,transparent_55%),radial-gradient(circle_at_75%_70%,#ffe600,transparent_50%)]" />
            <div className="relative z-10 bg-[#FAF7F0] text-[#0B0B0B] brutal-box-sm px-5 py-3.5 group-hover:scale-105 transition-transform">
              <div className="font-mono text-[10px] font-bold text-[#FF2E2E] uppercase mb-1">
                SCREENSHOT ATTACHED
              </div>
              <div className="font-sans font-extrabold text-base flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" /> Tap to unblur
              </div>
            </div>
          </div>

          <div className="relative font-serif text-base sm:text-lg leading-relaxed text-neutral-800 space-y-3">
            <p>
              Multiple people in the chat confirmed the details involving{" "}
              <strong>{payload.name}</strong> moments before screenshots started
              making the rounds.
            </p>
            <p className="blur-[4px] select-none pointer-events-none">
              According to the messages saved before deletion, three people had
              already forwarded the full thread before anyone noticed.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAF7F0] to-transparent" />
          </div>

          <button
            type="button"
            onClick={triggerTrap}
            className="w-full brutal-box brutal-press animate-pulse-cta bg-[#FF2E2E] text-white py-4 px-6 font-display text-2xl sm:text-3xl tracking-wider uppercase flex items-center justify-center gap-3 cursor-pointer"
          >
            Read Full Story <ArrowRight className="w-6 h-6" />
          </button>

          <section className="border-t-2 border-[#0B0B0B] pt-5 space-y-2.5">
            <div className="font-mono text-xs font-bold uppercase text-neutral-600">
              Top Comments ({decoyComments.length + 48})
            </div>
            {decoyComments.map((c, idx) => (
              <div
                key={idx}
                onClick={triggerTrap}
                className="brutal-box-sm bg-white p-3 cursor-pointer hover:bg-[#FFF9D6]"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm">@{c.user}</span>
                  <span className="font-mono text-[10px] text-neutral-500">{c.time}</span>
                </div>
                <p className="text-sm text-neutral-800">{c.text}</p>
              </div>
            ))}
          </section>
        </article>
      </main>
    );
  }

  // ==========================================================================
  // PHASE 2: CAUGHT IN 4K + CLEAN REVENGE BOX
  // ==========================================================================
  return (
    <main
      className={`min-h-screen w-full halftone-dark text-[#FAF7F0] relative overflow-x-hidden pb-16 ${
        shaking ? "animate-hard-shake" : ""
      }`}
    >
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-flashbang" />
      )}

      {/* Minimal Top HUD */}
      <div className="sticky top-0 z-30 bg-[#0B0B0B]/95 backdrop-blur-md border-b border-neutral-800 px-4 py-2.5">
        <div className="max-w-lg mx-auto flex items-center justify-between font-mono text-xs">
          <span className="flex items-center gap-2 font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E2E] animate-ping" />
            REC • 4K
          </span>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFE600] text-[#0B0B0B] font-bold px-2 py-0.5">
              Chain #{payload.chain || 1}
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 border border-neutral-700 text-white cursor-pointer"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Caught Banner */}
        <motion.div
          initial={{ scale: 1.4, rotate: -6, opacity: 0 }}
          animate={{ scale: 1, rotate: -2, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="bg-[#FF2E2E] border-[4px] border-white p-4 text-center shadow-[8px_8px_0px_#FFE600]"
        >
          <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#FFE600] flex items-center justify-center gap-1.5 mb-1">
            <Camera className="w-4 h-4" /> Caught on camera
          </div>
          <h1 className="font-display text-6xl sm:text-7xl tracking-wide text-white leading-none">
            CAUGHT IN 4K
          </h1>
        </motion.div>

        {/* Victim Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-[#FAF7F0] text-[#0B0B0B] border-[3px] border-[#0B0B0B] shadow-[8px_8px_0px_#FFE600] p-5 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B0B0B] text-[#FFE600] px-3 py-1.5 font-mono text-xs font-bold uppercase">
            <span>{payload.name}</span>
            {payload.sender && <span className="text-white">By {payload.sender}</span>}
          </div>

          <p className="font-serif font-extrabold text-xl leading-snug">
            “{headline}”
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="brutal-box-sm bg-[#FFE600] p-3">
              <div className="font-mono text-[10px] font-bold uppercase opacity-70">
                Clicked in
              </div>
              <div className="font-display text-4xl leading-tight">
                {reactionSeconds.toFixed(1)}s
              </div>
            </div>
            <div className="brutal-box-sm bg-[#FF2E2E] text-white p-3">
              <div className="font-mono text-[10px] font-bold uppercase opacity-80">
                Gullibility
              </div>
              <div className="font-display text-4xl leading-tight">
                {verdict.percent}%
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-[#0B0B0B] pt-3 space-y-1">
            <div className="font-mono text-[11px] font-bold uppercase text-[#FF2E2E]">
              {verdict.title}
            </div>
            <p className="font-sans font-bold text-base leading-snug">
              {verdict.roast}
            </p>
          </div>

          <button
            type="button"
            onClick={handleShareStory}
            disabled={storyStatus === "busy"}
            className="w-full brutal-box-sm brutal-press bg-[#0B0B0B] text-[#FFE600] py-3 font-sans text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {storyStatus === "done" ? (
              <>
                <Check className="w-4 h-4 text-[#00FF66]" /> Story Card Saved!
              </>
            ) : storyStatus === "busy" ? (
              <>Making Story Card...</>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Save Story Card (IG / WhatsApp)
              </>
            )}
          </button>
        </motion.div>

        {/* Simple Revenge Box */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-[#FFE600] text-[#0B0B0B] border-[3px] border-[#0B0B0B] shadow-[8px_8px_0px_#FF2E2E] p-5 space-y-4"
        >
          <div>
            <h2 className="font-display text-3xl sm:text-4xl tracking-wide leading-none">
              PRANK SOMEONE ELSE
            </h2>
            <p className="text-xs font-semibold text-[#0B0B0B]/75 mt-1">
              Type a friend's name and drop this in the group chat.
            </p>
          </div>

          <input
            type="text"
            value={nextVictim}
            onChange={(e) => setNextVictim(e.target.value)}
            placeholder="Next victim's name..."
            maxLength={28}
            className="w-full brutal-box-sm bg-white px-4 py-3 font-sans font-bold text-lg text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {(
                [
                  { id: "mix", label: "Mix" },
                  { id: "hi", label: "Hinglish" },
                  { id: "en", label: "EN" },
                ] as const
              ).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setNextLang(l.id);
                    rollFreshRevenge(l.id, nextSpice);
                  }}
                  className={`border-2 border-[#0B0B0B] px-2.5 py-1 text-xs font-bold cursor-pointer ${
                    nextLang === l.id ? "bg-[#0B0B0B] text-white" : "bg-white text-[#0B0B0B]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const flipped: SpiceMode = nextSpice === "dark" ? "chaotic" : "dark";
                  soundFX.playDiceTick();
                  setNextSpice(flipped);
                  rollFreshRevenge(nextLang, flipped);
                }}
                className={`border-2 border-[#0B0B0B] px-2.5 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  nextSpice === "dark" ? "bg-[#FF2E2E] text-white" : "bg-white text-[#0B0B0B]"
                }`}
              >
                <Skull className="w-3.5 h-3.5" /> Brutal
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                soundFX.playDiceTick();
                rollFreshRevenge();
              }}
              className="bg-[#0B0B0B] text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#FF2E2E]"
            >
              <Dices className="w-3.5 h-3.5" /> Shuffle
            </button>
          </div>

          <textarea
            rows={2}
            value={customInput.replaceAll("{name}", nextVictim.trim() || "Rohan")}
            onChange={(e) => setCustomInput(e.target.value)}
            className="w-full brutal-box-sm bg-white p-3 font-serif font-bold text-base text-[#0B0B0B] focus:outline-none resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleWhatsappRevenge}
              className="brutal-box brutal-press bg-[#00C853] text-[#0B0B0B] py-3.5 font-display text-xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp
            </button>

            <button
              type="button"
              onClick={handleCopyRevenge}
              className="brutal-box brutal-press bg-[#0B0B0B] text-[#FFE600] py-3.5 font-display text-xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-[#00FF66]" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Copy Link
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href={`/?chain=${(payload.chain || 1) + 1}&from=${encodeURIComponent(
                payload.name
              )}`}
              className="text-xs font-bold underline underline-offset-4 text-[#0B0B0B] hover:text-[#FF2E2E]"
            >
              Change link style (News / Leak / Secret Note) →
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
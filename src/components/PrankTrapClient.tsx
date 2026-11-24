// src/components/PrankTrapClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Camera,
  Check,
  Copy,
  Dices,
  Flame,
  Gift,
  Lock,
  MessageCircle,
  Newspaper,
  Play,
  Share2,
  Skull,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  ArrowRight,
  Clock,
  Eye,
  ShieldAlert,
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

const BAIT_CHAT_LINES_HI = [
  "bhai yeh kya scene hai?? jaldi dekh delete hone se pehle 💀",
  "bro wtf yeh tere baare mein kyun ghoom raha hai?? 👀",
  "arre bhai 2nd part padh iska, dimaag hil jayega 😭",
  "kisi ne abhi group mein daala yeh, jaldi dekh le",
];

const BAIT_CHAT_LINES_EN = [
  "bro wtf is this?? open before it gets taken down 💀",
  "wait why is everyone sending this around rn 👀",
  "nah read the second part of this 😭",
  "someone just dropped this link, thought you should see it first",
];

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

  // Trap State
  const mountedAtRef = useRef<number>(0);
  const [sprung, setSprung] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [reactionSeconds, setReactionSeconds] = useState(2.4);
  const [verdict, setVerdict] = useState<{
    title: string;
    percent: number;
    roast: string;
  }>({
    title: "CAUGHT IN 4K",
    percent: 96,
    roast: "Zero survival instinct.",
  });

  // Decoy fake urgency countdown + reader count
  const [countdown, setCountdown] = useState(payload.mode === "gift" ? 584 : 178);
  const [liveReaders, setLiveReaders] = useState(
    11400 + ((payload.seed || 421) % 4800)
  );

  // Story Card State
  const [storyStatus, setStoryStatus] = useState<"idle" | "busy" | "done">("idle");

  // Inline Revenge Generator State (Chain + 1)
  const [nextVictim, setNextVictim] = useState("");
  const [nextSender, setNextSender] = useState(payload.name || "");
  const [nextMode, setNextMode] = useState<BaitMode>(payload.mode);
  const [nextLang, setNextLang] = useState<LangMode>(payload.lang || "mix");
  const [nextSpice, setNextSpice] = useState<SpiceMode>(payload.spice || "chaotic");
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
      setCountdown((prev) => (prev > 12 ? prev - 1 : 59));
      setLiveReaders((prev) => prev + Math.floor(Math.random() * 9) - 3);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Roll initial fresh revenge headline once trap springs
  const rollFreshRevenge = (
    overrideMode?: BaitMode,
    overrideLang?: LangMode,
    overrideSpice?: SpiceMode
  ) => {
    const m = overrideMode ?? nextMode;
    const l = overrideLang ?? nextLang;
    const s = overrideSpice ?? nextSpice;
    const gen = generateInfiniteBait({
      name: "{name}",
      mode: m,
      lang: l,
      spice: s,
    });
    setRolledBait({
      headline: gen.headline,
      subhead: gen.subhead,
      tag: gen.tag,
    });
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

    const v = getGullibilityVerdict(
      rounded,
      payload.lang || "mix",
      payload.spice || "chaotic"
    );
    setVerdict(v);

    // Sensory explosion
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

    setTimeout(() => setFlashActive(false), 900);
    setTimeout(() => setShaking(false), 550);

    // Multi-burst confetti
    confetti({
      particleCount: 95,
      spread: 85,
      origin: { y: 0.52 },
      colors: ["#FF2E2E", "#FFE600", "#FFFFFF", "#0B0B0B"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.68 },
        colors: ["#FF2E2E", "#FFE600", "#FFFFFF"],
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.68 },
        colors: ["#FF2E2E", "#FFE600", "#FFFFFF"],
      });
    }, 240);
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

  // Build revenge URL
  const revengeUrl = useMemo(() => {
    const cleanVictim = nextVictim.trim() || "Rahul";
    const finalHeadline = (customInput || rolledBait?.headline || "BREAKING: {name} caught in 4K")
      .replaceAll("{name}", cleanVictim);

    const path = buildBaitPath({
      name: cleanVictim,
      customHeadline: finalHeadline,
      customSubhead: rolledBait?.subhead,
      customTag: rolledBait?.tag,
      mode: nextMode,
      lang: nextLang,
      spice: nextSpice,
      sender: nextSender.trim() || undefined,
      chain: (payload.chain || 1) + 1,
      seed: revengeSeed,
    });

    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [
    nextVictim,
    nextSender,
    customInput,
    rolledBait,
    nextMode,
    nextLang,
    nextSpice,
    payload.chain,
    revengeSeed,
  ]);

  const handleCopyRevenge = async () => {
    try {
      await navigator.clipboard.writeText(revengeUrl);
      soundFX.playCopySuccess();
      setCopied(true);
      confetti({
        particleCount: 28,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#FFE600", "#FF2E2E", "#FFFFFF"],
      });
      setTimeout(() => setCopied(false), 2600);
    } catch {
      window.prompt("Copy your bait link:", revengeUrl);
    }
  };

  const handleWhatsappRevenge = () => {
    soundFX.playClick();
    const lines = nextLang === "en" ? BAIT_CHAT_LINES_EN : BAIT_CHAT_LINES_HI;
    const tease = lines[revengeSeed % lines.length];
    const msg = `${tease}\n${revengeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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
      setTimeout(() => setStoryStatus("idle"), 2800);
    }
  };

  // ==========================================================================
  // PHASE 1: ULTRA-CONVINCING DECOY SCREEN
  // ==========================================================================
  if (!sprung) {
    // --- DECOY VARIANT A: MYSTERY GIFT / CONFESSION ---
    if (payload.mode === "gift") {
      return (
        <main className="min-h-screen w-full halftone-bg flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md space-y-4">
            {/* Top Urgency Strip */}
            <div className="brutal-box-sm bg-[#0B0B0B] text-[#FFE600] px-4 py-2.5 flex items-center justify-between font-mono text-xs font-bold tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E2E] animate-ping" />
                {meta.tag}
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <Clock className="w-3.5 h-3.5 text-[#FFE600]" />
                EXPIRES IN {formatTimer(countdown)}
              </span>
            </div>

            {/* Sealed Box Card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="brutal-box-lg bg-[#FFE600] p-6 sm:p-7 text-center relative overflow-hidden"
            >
              <div className="inline-block bg-[#0B0B0B] text-white font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-widest mb-5">
                LOCKED TO: {payload.name}
              </div>

              <motion.button
                type="button"
                onClick={triggerTrap}
                whileHover={{ scale: 1.04, rotate: -1 }}
                whileTap={{ scale: 0.96 }}
                className="w-36 h-36 mx-auto mb-5 bg-[#FAF7F0] brutal-box flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <Gift className="w-16 h-16 text-[#FF2E2E]" strokeWidth={2.2} />
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#0B0B0B] text-[#FFE600] px-2 py-0.5">
                  SEALED
                </span>
              </motion.button>

              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold leading-tight text-[#0B0B0B] mb-3">
                {headline}
              </h1>

              <p className="text-sm font-medium text-[#0B0B0B]/80 mb-6">
                {meta.subhead}
              </p>

              <button
                type="button"
                onClick={triggerTrap}
                className="w-full brutal-box brutal-press animate-pulse-cta bg-[#0B0B0B] text-[#FFE600] py-4 px-5 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-6 h-6" />
                TAP TO UNWRAP NOW
              </button>

              <p className="mt-3 font-mono text-[11px] text-[#0B0B0B]/70">
                1-time claim • {payload.sender ? "Sent by someone in your contacts" : "Verified private drop"}
              </p>
            </motion.div>

            {/* Fake Live Chat Reactions */}
            <div className="brutal-box-sm bg-white p-4 space-y-2.5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center justify-between">
                <span>RECENT CLAIMS</span>
                <span className="text-[#00A859]">● ONLINE</span>
              </div>
              {decoyComments.slice(0, 2).map((c, idx) => (
                <div
                  key={idx}
                  onClick={triggerTrap}
                  className="text-xs border-t border-neutral-200 pt-2 cursor-pointer"
                >
                  <span className="font-bold text-[#0B0B0B]">@{c.user}</span>{" "}
                  <span className="text-neutral-400 font-mono text-[10px]">{c.time}</span>
                  <p className="text-neutral-700 mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      );
    }

    // --- DECOY VARIANT B: RESTRICTED LEAK / CCTV ARCHIVE ---
    if (payload.mode === "leak") {
      return (
        <main className="min-h-screen w-full halftone-dark text-[#FAF7F0] flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-lg space-y-4">
            {/* Top Security Strip */}
            <div className="border-2 border-[#FF2E2E] bg-[#160A0A] px-4 py-2.5 flex items-center justify-between font-mono text-xs">
              <span className="text-[#FF2E2E] font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                {meta.tag} // MIRROR #04
              </span>
              <span className="text-[#FFE600] font-bold">
                AUTO-DEL {formatTimer(countdown)}
              </span>
            </div>

            {/* Main Leak Box */}
            <div className="border-[3px] border-white bg-[#121212] p-5 sm:p-6 shadow-[6px_6px_0px_#FF2E2E]">
              <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#FF2E2E]" />
                  {liveReaders.toLocaleString()} viewing
                </span>
                <span>FILE: {payload.name.toUpperCase()}_4K.MP4</span>
              </div>

              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold leading-tight text-white mb-3">
                {headline}
              </h1>

              <p className="text-sm text-neutral-300 mb-5">{meta.subhead}</p>

              {/* Fake Blurred Video / Evidence Player */}
              <div
                onClick={triggerTrap}
                className="relative w-full aspect-video bg-[#080808] border-2 border-neutral-700 mb-5 overflow-hidden cursor-pointer group flex flex-col items-center justify-center"
              >
                {/* Fake blurred redacted evidence lines */}
                <div className="absolute inset-0 p-5 flex flex-col justify-between opacity-35 blur-[5px] select-none pointer-events-none">
                  <div className="h-4 w-3/4 bg-neutral-500 rounded" />
                  <div className="h-24 w-full bg-gradient-to-tr from-neutral-800 via-red-900/50 to-neutral-700" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-neutral-600 rounded" />
                    <div className="h-3 w-2/3 bg-neutral-600 rounded" />
                  </div>
                </div>

                {/* CCTV HUD */}
                <div className="absolute top-3 left-3 font-mono text-[10px] text-red-400 bg-black/80 px-2 py-0.5">
                  ● REC 02:47:19 AM
                </div>
                <div className="absolute bottom-3 right-3 font-mono text-[10px] text-white bg-black/80 px-2 py-0.5">
                  00:47 HD
                </div>

                {/* Play Button */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-[#FF2E2E] border-[3px] border-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_25px_rgba(255,46,46,0.7)]">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                  <span className="font-mono text-xs font-bold bg-black/90 text-[#FFE600] px-3 py-1 border border-[#FFE600]/40 uppercase">
                    TAP TO UNBLUR CLIP + LOGS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={triggerTrap}
                className="w-full bg-[#FF2E2E] hover:bg-[#ff1919] text-white border-[3px] border-white py-4 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2.5 cursor-pointer shadow-[4px_4px_0px_#FFE600] active:translate-x-[2px] active:translate-y-[2px]"
              >
                <Lock className="w-5 h-5" />
                UNLOCK FULL LEAK NOW
              </button>
            </div>

            {/* Decoy Comments */}
            <div className="border-2 border-neutral-800 bg-[#111111] p-4 space-y-2.5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                LIVE REACTIONS ({decoyComments.length + 41})
              </div>
              {decoyComments.map((c, idx) => (
                <div
                  key={idx}
                  onClick={triggerTrap}
                  className="text-xs border-t border-neutral-800 pt-2 cursor-pointer"
                >
                  <span className="font-bold text-[#FFE600]">@{c.user}</span>{" "}
                  <span className="text-neutral-500 font-mono text-[10px]">{c.time}</span>
                  <p className="text-neutral-300 mt-0.5">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      );
    }

    // --- DECOY VARIANT C: LEGIT BREAKING NEWS ARTICLE ---
    return (
      <main className="min-h-screen w-full bg-[#FAF7F0] text-[#0B0B0B]">
        {/* Newspaper Masthead */}
        <header className="border-b-[3px] border-[#0B0B0B] bg-white sticky top-0 z-20">
          <div className="bg-[#FF2E2E] text-white text-[11px] font-mono font-bold py-1.5 px-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              BREAKING ALERT • {meta.tag}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {liveReaders.toLocaleString()} LIVE
            </span>
          </div>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-serif font-extrabold text-2xl sm:text-3xl tracking-tight">
              The Daily Dispatch
            </div>
            <div className="font-mono text-[10px] uppercase text-neutral-500 text-right">
              <div>UPDATED 2 MIN AGO</div>
              <div className="text-[#FF2E2E] font-bold">● VERIFIED DESK</div>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#0B0B0B] text-[#FFE600] font-mono text-[11px] font-bold px-2.5 py-0.5 uppercase">
              {meta.tag}
            </span>
            <span className="font-mono text-xs text-neutral-500">
              By Metro Desk • 2 min read
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0B0B0B] mb-4">
            {headline}
          </h1>

          <p className="font-serif text-lg text-neutral-700 leading-snug mb-6 border-l-4 border-[#FF2E2E] pl-4">
            {meta.subhead}
          </p>

          {/* Blurred Evidence Card */}
          <div
            onClick={triggerTrap}
            className="relative brutal-box bg-[#141414] aspect-[16/10] mb-6 overflow-hidden cursor-pointer group flex flex-col items-center justify-center p-4 text-center"
          >
            <div className="absolute inset-0 opacity-30 blur-md bg-[radial-gradient(circle_at_30%_30%,#ff2e2e,transparent_55%),radial-gradient(circle_at_75%_70%,#ffe600,transparent_50%)]" />
            <div className="absolute top-3 left-3 bg-black/80 text-white font-mono text-[10px] px-2.5 py-1 border border-white/20">
              SCREENSHOT + CLIP ATTACHED (4K)
            </div>
            <div className="relative z-10 bg-[#FAF7F0] text-[#0B0B0B] brutal-box-sm px-5 py-3.5 max-w-xs group-hover:scale-105 transition-transform">
              <div className="font-mono text-[10px] font-bold text-[#FF2E2E] uppercase tracking-widest mb-1">
                SENSITIVE FOOTAGE HIDDEN
              </div>
              <div className="font-sans font-extrabold text-base flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Tap to view unblurred proof
              </div>
            </div>
          </div>

          {/* Teaser Paragraph + Paywall Fade */}
          <div className="relative font-serif text-base sm:text-lg leading-relaxed text-neutral-800 space-y-4 mb-6">
            <p>
              <strong>LOCAL DESK —</strong> Multiple eyewitnesses confirmed the
              incident involving <strong>{payload.name}</strong> moments before
              screenshots began spreading rapidly across private WhatsApp groups.
            </p>
            <p className="blur-[4px] select-none pointer-events-none">
              According to the leaked transcript recovered at 2:14 AM, three close
              friends attempted to intervene before the full clip was uploaded to
              the group thread and viewed over fourteen thousand times.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF7F0] via-[#FAF7F0]/90 to-transparent" />
          </div>

          {/* Main Trap Trigger CTA */}
          <button
            type="button"
            onClick={triggerTrap}
            className="w-full brutal-box brutal-press animate-pulse-cta bg-[#FF2E2E] text-white py-4 px-6 font-display text-2xl sm:text-3xl tracking-wider uppercase flex items-center justify-center gap-3 cursor-pointer mb-8"
          >
            READ FULL STORY + WATCH CLIP
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Decoy Comment Section */}
          <section className="border-t-2 border-[#0B0B0B] pt-5 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs font-bold uppercase">
              <span>TOP COMMENTS ({decoyComments.length + 86})</span>
              <span className="text-[#FF2E2E]">SORT: HOTTEST</span>
            </div>
            {decoyComments.map((c, idx) => (
              <div
                key={idx}
                onClick={triggerTrap}
                className="brutal-box-sm bg-white p-3.5 cursor-pointer hover:bg-[#FFF9D6] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">@{c.user}</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {c.time}
                  </span>
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
  // PHASE 2: "CAUGHT IN 4K" DETONATION + STORY CARD + INSTANT REVENGE LOOP
  // ==========================================================================
  return (
    <main
      className={`min-h-screen w-full halftone-dark text-[#FAF7F0] relative overflow-x-hidden pb-16 ${
        shaking ? "animate-hard-shake" : ""
      }`}
    >
      {/* Camera Flashbang Overlay */}
      {flashActive && (
        <div className="fixed inset-0 z-50 bg-white pointer-events-none animate-flashbang" />
      )}

      {/* Camera Viewfinder Frame Corners */}
      <div className="fixed top-3 left-3 w-7 h-7 border-t-4 border-l-4 border-[#FF2E2E] pointer-events-none z-30" />
      <div className="fixed top-3 right-3 w-7 h-7 border-t-4 border-r-4 border-[#FF2E2E] pointer-events-none z-30" />
      <div className="fixed bottom-3 left-3 w-7 h-7 border-b-4 border-l-4 border-[#FF2E2E] pointer-events-none z-30" />
      <div className="fixed bottom-3 right-3 w-7 h-7 border-b-4 border-r-4 border-[#FF2E2E] pointer-events-none z-30" />

      {/* Top REC HUD Bar */}
      <div className="sticky top-0 z-30 bg-[#0B0B0B]/95 backdrop-blur-md border-b-2 border-neutral-800 px-4 py-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between font-mono text-xs">
          <span className="flex items-center gap-2 font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2E2E] animate-ping" />
            REC // 4K 60FPS
          </span>
          <div className="flex items-center gap-2.5">
            <span className="bg-[#FFE600] text-[#0B0B0B] font-bold px-2.5 py-0.5">
              CHAIN #{payload.chain || 1}
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 border border-neutral-700 hover:border-white text-white cursor-pointer"
              title={muted ? "Unmute FX" : "Mute FX"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">
        {/* Giant Slanted CAUGHT IN 4K Stamp */}
        <motion.div
          initial={{ scale: 1.5, rotate: -8, opacity: 0 }}
          animate={{ scale: 1, rotate: -2.5, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="bg-[#FF2E2E] border-[4px] border-white p-4 sm:p-5 text-center shadow-[8px_8px_0px_#FFE600]"
        >
          <div className="font-mono text-[11px] font-bold tracking-[0.25em] uppercase text-[#FFE600] flex items-center justify-center gap-2 mb-1">
            <Camera className="w-4 h-4" /> SNAPSHOT SAVED TO ARCHIVE
          </div>
          <h1 className="font-display text-6xl sm:text-7xl tracking-wide text-white leading-none">
            CAUGHT IN 4K
          </h1>
        </motion.div>

        {/* Brutalist Victim Receipt Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-[#FAF7F0] text-[#0B0B0B] border-[3px] border-[#0B0B0B] shadow-[8px_8px_0px_#FFE600] p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0B0B0B] text-[#FFE600] px-3.5 py-2 font-mono text-xs font-bold uppercase">
            <span>VICTIM: {payload.name}</span>
            {payload.sender && (
              <span className="text-white">SET UP BY: {payload.sender}</span>
            )}
          </div>

          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              YOU ACTUALLY FELL FOR:
            </div>
            <p className="font-serif font-extrabold text-xl sm:text-2xl leading-snug text-[#0B0B0B]">
              “{headline}”
            </p>
          </div>

          {/* Reaction Time + Gullibility Stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="brutal-box-sm bg-[#FFE600] p-3">
              <div className="font-mono text-[10px] font-bold uppercase text-[#0B0B0B]/70">
                CLICKED IN
              </div>
              <div className="font-display text-4xl text-[#0B0B0B] leading-tight">
                {reactionSeconds.toFixed(1)}s
              </div>
            </div>
            <div className="brutal-box-sm bg-[#FF2E2E] text-white p-3">
              <div className="font-mono text-[10px] font-bold uppercase text-white/80">
                GULLIBILITY
              </div>
              <div className="font-display text-4xl text-white leading-tight">
                {verdict.percent}%
              </div>
            </div>
          </div>

          {/* Dynamic Hinglish/EN/Dark Roast */}
          <div className="border-t-2 border-dashed border-[#0B0B0B] pt-3.5 space-y-1.5">
            <div className="inline-block bg-[#0B0B0B] text-white font-mono text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider">
              RANK: {verdict.title}
            </div>
            <p className="font-sans font-bold text-sm sm:text-base text-[#0B0B0B] leading-snug">
              {verdict.roast}
            </p>
          </div>

          {/* Share Story Card CTA */}
          <button
            type="button"
            onClick={handleShareStory}
            disabled={storyStatus === "busy"}
            className="w-full brutal-box-sm brutal-press bg-[#0B0B0B] text-[#FFE600] py-3.5 px-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            {storyStatus === "done" ? (
              <>
                <Check className="w-4 h-4 text-[#00FF66]" /> STORY CARD SAVED / SHARED!
              </>
            ) : storyStatus === "busy" ? (
              <>GENERATING 1080×1920 CARD...</>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> SHARE / SAVE STORY RECEIPT (IG • WA)
              </>
            )}
          </button>
        </motion.div>

        {/* ====================================================================
            THE VIRAL REVENGE LOOP — PRANK SOMEONE ELSE IMMEDIATELY
           ==================================================================== */}
        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-[#FFE600] text-[#0B0B0B] border-[3px] border-[#0B0B0B] shadow-[8px_8px_0px_#FF2E2E] p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#0B0B0B] text-[#FFE600] inline-block px-2 py-0.5 mb-1">
                DON'T TAKE THIS L ALONE • CHAIN #{(payload.chain || 1) + 1}
              </div>
              <h2 className="font-display text-3xl sm:text-4xl tracking-wide leading-none">
                NOW PRANK SOMEONE ELSE
              </h2>
            </div>
            <Flame className="w-9 h-9 text-[#FF2E2E] flex-shrink-0" />
          </div>

          {/* Victim & Your Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                NEXT VICTIM'S NAME *
              </label>
              <input
                type="text"
                value={nextVictim}
                onChange={(e) => setNextVictim(e.target.value)}
                placeholder="e.g. Rohan, Priya..."
                maxLength={28}
                className="w-full brutal-box-sm bg-white px-3.5 py-2.5 font-sans font-bold text-base text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDE8]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase mb-1">
                YOUR NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={nextSender}
                onChange={(e) => setNextSender(e.target.value)}
                placeholder="Stay anonymous or sign it"
                maxLength={24}
                className="w-full brutal-box-sm bg-white px-3.5 py-2.5 font-sans font-bold text-base text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Disguise + Language + Spice Pills */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "news", label: "NEWS", icon: Newspaper },
                  { id: "gift", label: "GIFT", icon: Gift },
                  { id: "leak", label: "LEAK", icon: Lock },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const active = nextMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setNextMode(m.id);
                      rollFreshRevenge(m.id, nextLang, nextSpice);
                    }}
                    className={`brutal-box-sm py-2 px-2 font-mono text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      active
                        ? "bg-[#0B0B0B] text-[#FFE600]"
                        : "bg-white text-[#0B0B0B] hover:bg-neutral-100"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "mix", label: "MIX (HI+EN)" },
                  { id: "hi", label: "HINGLISH" },
                  { id: "en", label: "ENGLISH" },
                ] as const
              ).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => {
                    soundFX.playClick();
                    setNextLang(l.id);
                    rollFreshRevenge(nextMode, l.id, nextSpice);
                  }}
                  className={`border-2 border-[#0B0B0B] px-2.5 py-1 font-mono text-[10px] font-bold cursor-pointer ${
                    nextLang === l.id
                      ? "bg-[#0B0B0B] text-white"
                      : "bg-white text-[#0B0B0B]"
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
                  rollFreshRevenge(nextMode, nextLang, flipped);
                }}
                className={`ml-auto border-2 border-[#0B0B0B] px-2.5 py-1 font-mono text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                  nextSpice === "dark"
                    ? "bg-[#FF2E2E] text-white"
                    : "bg-white text-[#0B0B0B]"
                }`}
              >
                <Skull className="w-3 h-3" />
                {nextSpice === "dark" ? "DARK MODE: ON" : "DARK TURN"}
              </button>
            </div>
          </div>

          {/* Editable Rolled Headline + Infinite Roll Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] font-bold uppercase">
                BAIT HEADLINE (EDITABLE)
              </label>
              <button
                type="button"
                onClick={() => {
                  soundFX.playDiceTick();
                  rollFreshRevenge();
                }}
                className="bg-[#0B0B0B] text-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer hover:bg-[#FF2E2E] transition-colors"
              >
                <Dices className="w-3.5 h-3.5" /> ROLL FRESH ONE
              </button>
            </div>
            <textarea
              rows={2}
              value={customInput.replaceAll("{name}", nextVictim.trim() || "Rahul")}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full brutal-box-sm bg-white p-3 font-sans font-bold text-sm text-[#0B0B0B] focus:outline-none resize-none"
            />
          </div>

          {/* Action Buttons: WhatsApp + Copy Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleWhatsappRevenge}
              className="brutal-box brutal-press bg-[#00C853] text-[#0B0B0B] py-3.5 px-4 font-display text-xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" /> DROP IN WHATSAPP
            </button>

            <button
              type="button"
              onClick={handleCopyRevenge}
              className="brutal-box brutal-press bg-[#0B0B0B] text-[#FFE600] py-3.5 px-4 font-display text-xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-[#00FF66]" /> LINK COPIED!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> COPY BAIT LINK
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-1">
            <Link
              href={`/?chain=${(payload.chain || 1) + 1}&from=${encodeURIComponent(
                payload.name
              )}`}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase underline underline-offset-4 text-[#0B0B0B] hover:text-[#FF2E2E]"
            >
              <Zap className="w-3.5 h-3.5" /> Open Full Creator Studio
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
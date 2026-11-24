// src/components/MemeStudio.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Dices,
  Download,
  ImagePlus,
  Loader2,
  Palette,
  Share2,
  Skull,
  Sparkles,
  X,
} from "lucide-react";
import {
  MEME_FORMATS,
  MEME_PALETTES,
  MEME_STAMPS,
  MEME_TEXTURES,
  MemeContent,
  MemeFormatId,
  MemeStyleConfig,
  getDefaultStyleForFormat,
  getStarterContent,
  remixStyle,
} from "@/lib/memeTemplates";
import {
  copyMemeToClipboard,
  loadImageFromFile,
  renderMemeToCanvas,
  shareOrDownloadMeme,
} from "@/lib/memeCanvas";
import {
  LangMode,
  SpiceMode,
  generateInfiniteBait,
} from "@/lib/prankEngine";
import { soundFX } from "@/lib/soundEngine";

interface MemeStudioProps {
  victimName: string;
  onVictimNameChange: (name: string) => void;
  lang: LangMode;
  onLangChange: (lang: LangMode) => void;
  spice: SpiceMode;
  onSpiceChange: (spice: SpiceMode) => void;
}

export default function MemeStudio({
  victimName,
  onVictimNameChange,
  lang,
  onLangChange,
  spice,
  onSpiceChange,
}: MemeStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayName = victimName.trim() || "Rohan";

  const [style, setStyle] = useState<MemeStyleConfig>(() =>
    getDefaultStyleForFormat("viewfinder_4k")
  );
  const [content, setContent] = useState<MemeContent>(() =>
    getStarterContent("Rohan")
  );
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [showAdvancedText, setShowAdvancedText] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);

  const [improvising, setImprovising] = useState(false);
  const [improviseNote, setImproviseNote] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "unsupported">("idle");
  const [shareState, setShareState] = useState<"idle" | "done">("idle");

  // Keep canvas synced with latest content, style, photo, and web fonts
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderMemeToCanvas(
      canvas,
      { ...content, name: displayName },
      style,
      { photo }
    );
  }, [content, displayName, style, photo]);

  useEffect(() => {
    drawCanvas();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        drawCanvas();
      });
    }
  }, [drawCanvas]);

  const handleSelectFormat = (formatId: MemeFormatId) => {
    soundFX.playClick();
    setStyle(getDefaultStyleForFormat(formatId));
  };

  const handleRemixLook = (switchFormatToo = false) => {
    soundFX.playDiceTick();
    setStyle((prev) => remixStyle(prev, !switchFormatToo));
  };

  const handleLocalShuffle = () => {
    soundFX.playDiceTick();
    const rolled = generateInfiniteBait({
      name: displayName,
      mode: style.format === "group_poll" ? "leak" : "news",
      lang,
      spice,
    });
    const extra1 = generateInfiniteBait({
      name: displayName,
      mode: "news",
      lang,
      spice,
    });
    const extra2 = generateInfiniteBait({
      name: displayName,
      mode: "leak",
      lang,
      spice,
    });

    setContent((prev) => ({
      ...prev,
      name: displayName,
      headline: rolled.headline,
      subline: rolled.subhead,
      tickerText: `${rolled.tag}: ${rolled.headline.toUpperCase()}  •  GROUP CHAT RECEIPTS VERIFIED`,
      items: [
        rolled.headline.replace(/^[A-Z\s]+:\s*/, "").slice(0, 44),
        extra1.headline.replace(/^[A-Z\s]+:\s*/, "").slice(0, 44),
        extra2.headline.replace(/^[A-Z\s]+:\s*/, "").slice(0, 44),
        lang === "en" ? "Left chat on seen for 3 days" : '"Phone silent pe tha" x5',
      ],
    }));
    setStyle((prev) => remixStyle(prev, true));
  };

  const handleAIImprovise = async () => {
    if (improvising) return;
    soundFX.playClick();
    setImprovising(true);
    setImproviseNote("");

    try {
      const res = await fetch("/api/improvise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          draft: content.headline,
          format: style.format,
          lang,
          brutal: spice === "dark",
        }),
      });

      const data = await res.json();
      setContent({
        name: displayName,
        headline: data.headline || content.headline,
        subline: data.subline || content.subline,
        saidText: data.saidText || content.saidText,
        realityText: data.realityText || content.realityText,
        tickerText: data.tickerText || content.tickerText,
        items:
          Array.isArray(data.items) && data.items.length >= 3
            ? data.items
            : content.items,
        totalLabel: data.totalLabel || content.totalLabel,
        apologyBody: data.apologyBody || content.apologyBody,
      });

      // Give a fresh visual remix each time AI improvises
      setStyle((prev) => remixStyle(prev, true));
      soundFX.playCopySuccess();

      if (data.source === "local-no-key") {
        setImproviseNote("Add GEMINI_API_KEY in .env.local / Vercel for live sharpening.");
      }
    } catch {
      handleLocalShuffle();
    } finally {
      setImprovising(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await loadImageFromFile(file);
    if (img) {
      soundFX.playClick();
      setPhoto(img);
      setPhotoName(file.name);
      // Automatically switch to a photo-supporting layout if currently on receipt/apology
      if (style.format !== "viewfinder_4k" && style.format !== "breaking_tv") {
        setStyle(getDefaultStyleForFormat("viewfinder_4k"));
      }
    }
    e.target.value = "";
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    const result = await copyMemeToClipboard(canvasRef.current);
    if (result === "copied") {
      soundFX.playCopySuccess();
      setCopyState("copied");
      confetti({
        particleCount: 30,
        spread: 55,
        origin: { y: 0.72 },
        colors: ["#FF2E2E", "#FFE600", "#0B0B0B", "#FFFFFF"],
      });
      setTimeout(() => setCopyState("idle"), 2400);
    } else {
      // Fallback for mobile browsers that don't support ClipboardItem image writes
      setCopyState("unsupported");
      await handleShareOrDownload();
      setTimeout(() => setCopyState("idle"), 2200);
    }
  };

  const handleShareOrDownload = async () => {
    if (!canvasRef.current) return;
    soundFX.playClick();
    const outcome = await shareOrDownloadMeme(
      canvasRef.current,
      displayName,
      style.format
    );
    if (outcome !== "failed") {
      soundFX.playCopySuccess();
      setShareState("done");
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const handleDirectDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    soundFX.playCopySuccess();
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const clean = displayName.toLowerCase().replace(/[^a-z0-9]/g, "") || "friend";
    a.href = url;
    a.download = `${style.format}-${clean}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const supportsPhoto =
    style.format === "viewfinder_4k" || style.format === "breaking_tv";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: SIMPLE CONTROLS */}
      <section className="lg:col-span-6 space-y-5">
        {/* Card 1: Name + Format Picker */}
        <div className="brutal-box bg-white p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
                Friend's Name
              </label>
              <input
                type="text"
                value={victimName}
                onChange={(e) => onVictimNameChange(e.target.value)}
                placeholder="Rohan, Priya, Kabir..."
                maxLength={28}
                className="w-full brutal-box-sm bg-[#FAF7F0] px-4 py-2.5 font-sans font-bold text-lg text-[#0B0B0B] placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFF9D6]"
              />
            </div>

            {/* Optional Friend Photo Upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {photo ? (
                <div className="brutal-box-sm bg-[#FAF7F0] px-3 py-2.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold truncate">
                    {photoName || "Photo added"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      soundFX.playClick();
                      setPhoto(null);
                      setPhotoName("");
                    }}
                    className="p-0.5 hover:text-[#FF2E2E] cursor-pointer"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full brutal-box-sm brutal-press bg-[#FAF7F0] hover:bg-[#FFF5B8] px-3.5 py-2.5 font-sans font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ImagePlus className="w-4 h-4" />
                  {supportsPhoto ? "Add Friend Photo" : "Add Photo (4K / TV)"}
                </button>
              )}
            </div>
          </div>

          {/* 6 Distinct Formats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wide text-neutral-600">
                Format
              </label>
              <button
                type="button"
                onClick={() => handleRemixLook(true)}
                className="text-xs font-bold underline underline-offset-4 hover:text-[#FF2E2E] cursor-pointer"
              >
                Surprise me
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MEME_FORMATS.map((fmt) => {
                const active = style.format === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => handleSelectFormat(fmt.id)}
                    className={`brutal-box-sm brutal-press px-3 py-2.5 text-left cursor-pointer transition-colors ${
                      active
                        ? "bg-[#0B0B0B] text-[#FFE600]"
                        : "bg-[#FAF7F0] text-[#0B0B0B] hover:bg-[#FFF5B8]"
                    }`}
                  >
                    <div className="font-sans font-extrabold text-xs sm:text-sm leading-tight">
                      {fmt.label}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 truncate ${
                        active ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {fmt.hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Text Input + AI Improvise + Shuffle */}
        <div className="brutal-box bg-white p-5 space-y-4">
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
                    onLangChange(l.id);
                  }}
                  className={`border-2 border-[#0B0B0B] px-2.5 py-1 text-xs font-bold cursor-pointer ${
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
                soundFX.playClick();
                onSpiceChange(spice === "dark" ? "chaotic" : "dark");
              }}
              className={`border-2 border-[#0B0B0B] px-3 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                spice === "dark"
                  ? "bg-[#FF2E2E] text-white"
                  : "bg-[#FAF7F0] text-[#0B0B0B] hover:bg-neutral-200"
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              {spice === "dark" ? "Brutal: ON" : "Brutal Mode"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5">
              What did they do / lie about?
            </label>
            <textarea
              rows={3}
              value={content.headline}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, headline: e.target.value }))
              }
              placeholder='e.g. "said phone was on silent while posting 4 stories"'
              className="w-full brutal-box-sm bg-[#FAF7F0] p-3.5 font-serif font-bold text-base sm:text-lg leading-snug text-[#0B0B0B] focus:outline-none focus:bg-[#FFF9D6] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAIImprovise}
              disabled={improvising}
              className="brutal-box-sm brutal-press bg-[#0B0B0B] text-[#FFE600] hover:bg-[#FF2E2E] hover:text-white py-2.5 px-3 font-sans font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-70"
            >
              {improvising ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sharpening...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Improvise (AI)
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLocalShuffle}
              className="brutal-box-sm brutal-press bg-[#FFE600] hover:bg-[#0B0B0B] hover:text-white py-2.5 px-3 font-sans font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Dices className="w-4 h-4" /> Shuffle Idea
            </button>
          </div>

          {improviseNote && (
            <p className="font-mono text-[11px] text-[#FF2E2E] font-bold">
              {improviseNote}
            </p>
          )}

          {/* Optional Fine-Tune Fields (Collapsed by default to keep UI clean) */}
          <div className="border-t-2 border-dashed border-neutral-300 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvancedText((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase text-neutral-600 hover:text-[#0B0B0B] cursor-pointer"
            >
              <span>Edit extra lines on this template</span>
              {showAdvancedText ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showAdvancedText && (
              <div className="mt-3 space-y-3">
                {style.format === "viewfinder_4k" && (
                  <>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1">
                        What they said
                      </label>
                      <input
                        type="text"
                        value={content.saidText}
                        onChange={(e) =>
                          setContent((p) => ({ ...p, saidText: e.target.value }))
                        }
                        className="w-full border-2 border-[#0B0B0B] bg-[#FAF7F0] px-3 py-2 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1">
                        Actual reality
                      </label>
                      <input
                        type="text"
                        value={content.realityText}
                        onChange={(e) =>
                          setContent((p) => ({ ...p, realityText: e.target.value }))
                        }
                        className="w-full border-2 border-[#0B0B0B] bg-[#FAF7F0] px-3 py-2 text-sm font-medium focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {style.format === "breaking_tv" && (
                  <>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1">
                        Sub-caption
                      </label>
                      <input
                        type="text"
                        value={content.subline}
                        onChange={(e) =>
                          setContent((p) => ({ ...p, subline: e.target.value }))
                        }
                        className="w-full border-2 border-[#0B0B0B] bg-[#FAF7F0] px-3 py-2 text-sm font-medium focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1">
                        Bottom TV Ticker
                      </label>
                      <input
                        type="text"
                        value={content.tickerText}
                        onChange={(e) =>
                          setContent((p) => ({ ...p, tickerText: e.target.value }))
                        }
                        className="w-full border-2 border-[#0B0B0B] bg-[#FAF7F0] px-3 py-2 text-sm font-mono focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {(style.format === "thermal_receipt" ||
                  style.format === "search_leak" ||
                  style.format === "group_poll") && (
                  <div className="space-y-2">
                    <label className="block font-mono text-[10px] font-bold uppercase text-neutral-500">
                      List items (1 per line)
                    </label>
                    {content.items.slice(0, 4).map((item, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...content.items];
                          updated[idx] = e.target.value;
                          setContent((p) => ({ ...p, items: updated }));
                        }}
                        className="w-full border-2 border-[#0B0B0B] bg-[#FAF7F0] px-3 py-1.5 text-sm font-medium focus:outline-none"
                      />
                    ))}
                    {style.format === "thermal_receipt" && (
                      <input
                        type="text"
                        value={content.totalLabel}
                        onChange={(e) =>
                          setContent((p) => ({ ...p, totalLabel: e.target.value }))
                        }
                        placeholder="TOTAL: SHAMELESS"
                        className="w-full border-2 border-[#0B0B0B] bg-[#FFF9D6] px-3 py-1.5 text-sm font-mono font-bold focus:outline-none"
                      />
                    )}
                  </div>
                )}

                {style.format === "pr_apology" && (
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase text-neutral-500 mb-1">
                      Apology Statement Body
                    </label>
                    <textarea
                      rows={4}
                      value={content.apologyBody}
                      onChange={(e) =>
                        setContent((p) => ({ ...p, apologyBody: e.target.value }))
                      }
                      className="w-full border-2 border-[#0B0B0B] bg-[#FAF7F0] p-3 text-sm font-serif focus:outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT COLUMN: LIVE CANVAS PREVIEW + REMIX LOOK + EXPORT */}
      <aside className="lg:col-span-6 lg:sticky lg:top-6 space-y-4">
        {/* Live Rendered Meme Canvas */}
        <div className="brutal-box bg-[#0B0B0B] p-3 space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="font-mono text-[11px] font-bold text-neutral-300 uppercase">
              {style.caseNumber} • 1080×1200
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStylePicker((v) => !v)}
                className="border border-neutral-600 hover:border-white text-white px-2.5 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5 text-[#FFE600]" />
                Customize
              </button>

              <button
                type="button"
                onClick={() => handleRemixLook(false)}
                className="bg-[#FFE600] text-[#0B0B0B] hover:bg-[#FF2E2E] hover:text-white px-3 py-1 font-mono text-[10px] font-extrabold uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Dices className="w-3.5 h-3.5" />
                Remix Look
              </button>
            </div>
          </div>

          {/* Optional Quick Theme / Stamp / Texture Strip */}
          {showStylePicker && (
            <div className="bg-[#161616] border border-neutral-700 p-3 space-y-3 text-white">
              <div>
                <div className="font-mono text-[10px] text-neutral-400 uppercase mb-1.5">
                  Color Theme ({MEME_PALETTES.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {MEME_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => {
                        soundFX.playClick();
                        setStyle((p) => ({ ...p, paletteId: pal.id }));
                      }}
                      className={`px-2 py-1 font-mono text-[10px] font-bold border cursor-pointer flex items-center gap-1.5 ${
                        style.paletteId === pal.id
                          ? "border-[#FFE600] bg-white text-black"
                          : "border-neutral-700 bg-black text-neutral-200"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/40"
                        style={{ backgroundColor: pal.accent }}
                      />
                      {pal.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="font-mono text-[10px] text-neutral-400 uppercase mb-1">
                    Stamp
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {MEME_STAMPS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStyle((p) => ({ ...p, stamp: st.id }));
                        }}
                        className={`px-2 py-0.5 font-mono text-[10px] font-bold border cursor-pointer ${
                          style.stamp === st.id
                            ? "bg-[#FF2E2E] text-white border-white"
                            : "bg-black text-neutral-300 border-neutral-700"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="font-mono text-[10px] text-neutral-400 uppercase mb-1">
                    Texture
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {MEME_TEXTURES.map((tx) => (
                      <button
                        key={tx}
                        type="button"
                        onClick={() => {
                          soundFX.playClick();
                          setStyle((p) => ({ ...p, texture: tx }));
                        }}
                        className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase border cursor-pointer ${
                          style.texture === tx
                            ? "bg-[#FFE600] text-black border-[#FFE600]"
                            : "bg-black text-neutral-300 border-neutral-700"
                        }`}
                      >
                        {tx}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crisp Scaled Canvas Preview */}
          <div className="w-full overflow-hidden border border-neutral-800 bg-black">
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
            />
          </div>
        </div>

        {/* Export / Share Buttons */}
        <div className="brutal-box bg-[#FFE600] p-4 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleShareOrDownload}
              className="brutal-box brutal-press bg-[#00C853] text-[#0B0B0B] py-3.5 px-4 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              {shareState === "done" ? (
                <>
                  <Check className="w-5 h-5" /> Ready!
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" /> Share Image
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              className="brutal-box brutal-press bg-[#0B0B0B] text-[#FFE600] py-3.5 px-4 font-display text-2xl tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="w-5 h-5 text-[#00FF66]" /> Copied PNG!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" /> Copy Image
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleDirectDownload}
            className="w-full py-1.5 font-sans text-xs font-bold underline underline-offset-4 text-[#0B0B0B] hover:text-[#FF2E2E] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PNG to device
          </button>
        </div>
      </aside>
    </div>
  );
}
// src/lib/memeCanvas.ts
import {
  MEME_STAMPS,
  MemeContent,
  MemeFontStyle,
  MemePalette,
  MemeStyleConfig,
  MemeTextureId,
  getPaletteById,
} from "./memeTemplates";

export const MEME_WIDTH = 1080;
export const MEME_HEIGHT = 1200;

export interface RenderMemeOptions {
  photo?: HTMLImageElement | null;
  siteTag?: string;
}

function getFonts(style: MemeFontStyle) {
  switch (style) {
    case "editorial":
      return {
        display: '"Newsreader", Georgia, serif',
        body: '"Space Grotesk", system-ui, sans-serif',
        mono: '"JetBrains Mono", monospace',
      };
    case "terminal":
      return {
        display: '"JetBrains Mono", monospace',
        body: '"JetBrains Mono", monospace',
        mono: '"JetBrains Mono", monospace',
      };
    case "clean":
      return {
        display: '"Space Grotesk", system-ui, sans-serif',
        body: '"Space Grotesk", system-ui, sans-serif',
        mono: '"JetBrains Mono", monospace',
      };
    case "brutal":
    default:
      return {
        display: '"Anton", Impact, Arial Black, sans-serif',
        body: '"Space Grotesk", system-ui, sans-serif',
        mono: '"JetBrains Mono", monospace',
      };
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / Math.max(1, img.naturalHeight);
  const boxRatio = w / Math.max(1, h);
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (imgRatio > boxRatio) {
    sw = img.naturalHeight * boxRatio;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / boxRatio;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ");
  if (!words[0]) return [];
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) {
        // Fill the remaining words onto the last line with ellipsis if needed
        break;
      }
    } else {
      current = candidate;
    }
  }

  if (lines.length === maxLines - 1) {
    const usedWordCount = lines.join(" ").split(" ").length;
    let tail = words.slice(usedWordCount).join(" ");
    while (ctx.measureText(tail).width > maxWidth && tail.length > 4) {
      tail = tail.slice(0, -2).trimEnd() + "…";
    }
    if (tail) lines.push(tail);
  } else if (current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

function drawTexture(
  ctx: CanvasRenderingContext2D,
  texture: MemeTextureId,
  palette: MemePalette
) {
  if (texture === "clean") return;
  ctx.save();
  const ink = palette.dark ? "rgba(255,255,255,0.065)" : "rgba(0,0,0,0.06)";

  if (texture === "halftone") {
    ctx.fillStyle = ink;
    for (let x = 20; x < MEME_WIDTH; x += 28) {
      for (let y = 20; y < MEME_HEIGHT; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (texture === "scanlines") {
    ctx.fillStyle = palette.dark ? "rgba(255,255,255,0.045)" : "rgba(0,0,0,0.04)";
    for (let y = 0; y < MEME_HEIGHT; y += 8) {
      ctx.fillRect(0, y, MEME_WIDTH, 2);
    }
  } else if (texture === "grid") {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= MEME_WIDTH; x += 54) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MEME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= MEME_HEIGHT; y += 54) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MEME_WIDTH, y);
      ctx.stroke();
    }
  } else if (texture === "paper") {
    ctx.fillStyle = ink;
    // Deterministic grain specks so preview never flickers on re-render
    let s = 918273;
    for (let i = 0; i < 1600; i++) {
      s = (s * 1664525 + 1013904223) >>> 0;
      const x = s % MEME_WIDTH;
      s = (s * 1664525 + 1013904223) >>> 0;
      const y = s % MEME_HEIGHT;
      ctx.fillRect(x, y, 2.5, 2.5);
    }
  }
  ctx.restore();
}

function drawStamp(
  ctx: CanvasRenderingContext2D,
  style: MemeStyleConfig,
  palette: MemePalette
) {
  if (style.stamp === "none") return;
  const stampMeta = MEME_STAMPS.find((s) => s.id === style.stamp);
  if (!stampMeta) return;

  ctx.save();
  ctx.translate(825, 195);
  ctx.rotate(-0.14);

  ctx.font = '800 32px "JetBrains Mono", monospace';
  const textW = ctx.measureText(stampMeta.label).width;
  const boxW = textW + 52;
  const boxH = 74;

  ctx.fillStyle = palette.accent;
  ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
  ctx.strokeStyle = palette.accentText;
  ctx.lineWidth = 5;
  ctx.strokeRect(-boxW / 2 + 5, -boxH / 2 + 5, boxW - 10, boxH - 10);

  ctx.fillStyle = palette.accentText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stampMeta.label, 0, 2);
  ctx.restore();
}

function getCleanSiteTag(explicit?: string): string {
  const raw =
    explicit ||
    process.env.NEXT_PUBLIC_SITE_TAG ||
    (typeof window !== "undefined" ? window.location.host : "TRACTION.VERCEL.APP");
  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toUpperCase()
    .slice(0, 28);
}

// ============================================================================
// FORMAT 1: 4K CAMERA VIEWFINDER ("CAUGHT LYING IN BROAD DAYLIGHT")
// ============================================================================
function renderViewfinder4K(
  ctx: CanvasRenderingContext2D,
  content: MemeContent,
  style: MemeStyleConfig,
  palette: MemePalette,
  siteTag: string,
  photo: HTMLImageElement | null
) {
  const fonts = getFonts(style.fontStyle);
  const pad = 54;

  // Viewfinder brackets
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 8;
  const arm = 58;
  const corners = [
    [pad, pad, 1, 1],
    [MEME_WIDTH - pad, pad, -1, 1],
    [pad, MEME_HEIGHT - pad, 1, -1],
    [MEME_WIDTH - pad, MEME_HEIGHT - pad, -1, -1],
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * arm);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * arm, cy);
    ctx.stroke();
  });

  // Top REC bar
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(pad + 36, pad + 42, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = palette.text;
  ctx.font = `700 28px ${fonts.mono}`;
  ctx.fillText(`REC  //  ${style.caseNumber}`, pad + 64, pad + 52);

  ctx.fillStyle = palette.muted;
  ctx.textAlign = "right";
  ctx.fillText("BROAD DAYLIGHT • 4K", MEME_WIDTH - pad - 24, pad + 52);
  ctx.textAlign = "left";

  // Top Visual Area (Photo OR Big Headline Stage)
  const stageX = pad + 24;
  const stageY = 148;
  const stageW = MEME_WIDTH - (pad + 24) * 2;
  const stageH = photo ? 500 : 455;

  ctx.fillStyle = palette.surface;
  ctx.fillRect(stageX, stageY, stageW, stageH);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 5;
  ctx.strokeRect(stageX, stageY, stageW, stageH);

  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(stageX + 3, stageY + 3, stageW - 6, stageH - 6);
    ctx.clip();
    drawImageCover(ctx, photo, stageX, stageY, stageW, stageH);
    // Dark bottom vignette for headline legibility
    const grad = ctx.createLinearGradient(0, stageY + stageH - 220, 0, stageY + stageH);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.88)");
    ctx.fillStyle = grad;
    ctx.fillRect(stageX, stageY + stageH - 220, stageW, 220);
    ctx.restore();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 44px ${fonts.body}`;
    const hLines = wrapLines(ctx, content.headline, stageW - 56, 3);
    const startY = stageY + stageH - 28 - (hLines.length - 1) * 52;
    hLines.forEach((line, i) => {
      ctx.fillText(line, stageX + 28, startY + i * 52);
    });
  } else {
    // Subject pill
    ctx.fillStyle = palette.accent;
    ctx.fillRect(stageX + 34, stageY + 34, 340, 48);
    ctx.fillStyle = palette.accentText;
    ctx.font = `700 24px ${fonts.mono}`;
    ctx.fillText(`SUBJECT: ${(content.name || "ROHAN").toUpperCase()}`, stageX + 52, stageY + 67);

    // Big headline
    ctx.fillStyle = palette.text;
    const isBrutal = style.fontStyle === "brutal";
    ctx.font = isBrutal ? `400 58px ${fonts.display}` : `800 50px ${fonts.display}`;
    const hLines = wrapLines(ctx, content.headline, stageW - 68, 4);
    hLines.forEach((line, i) => {
      ctx.fillText(line, stageX + 34, stageY + 158 + i * 66);
    });

    // Subline
    ctx.fillStyle = palette.muted;
    ctx.font = `600 26px ${fonts.body}`;
    const subLines = wrapLines(ctx, content.subline, stageW - 68, 2);
    subLines.forEach((line, i) => {
      ctx.fillText(line, stageX + 34, stageY + stageH - 56 + i * 34);
    });
  }

  // *** UNCROPPABLE SANDWICHED CAMERA TELEMETRY BAR (MIDDLE OF IMAGE) ***
  const hudY = stageY + stageH + 22;
  const hudH = 56;
  ctx.fillStyle = palette.accent;
  ctx.fillRect(stageX, hudY, stageW, hudH);

  ctx.fillStyle = palette.accentText;
  ctx.font = `700 23px ${fonts.mono}`;
  ctx.textBaseline = "middle";
  ctx.fillText(`ISO 800  •  60FPS  •  4K`, stageX + 24, hudY + hudH / 2);
  ctx.textAlign = "right";
  ctx.fillText(`${siteTag}  //  VERIFIED`, stageX + stageW - 24, hudY + hudH / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // Bottom Punchline Cards: SAID vs REALITY
  const cardsY = hudY + hudH + 24;
  const cardsH = MEME_HEIGHT - pad - 24 - cardsY;
  const gap = 24;
  const colW = (stageW - gap) / 2;

  // SAID box
  ctx.fillStyle = palette.surface;
  ctx.fillRect(stageX, cardsY, colW, cardsH);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(stageX, cardsY, colW, cardsH);

  ctx.fillStyle = palette.muted;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.fillText("WHAT THEY SAID:", stageX + 26, cardsY + 48);

  ctx.fillStyle = palette.text;
  ctx.font = `700 34px ${fonts.body}`;
  const saidLines = wrapLines(ctx, content.saidText, colW - 52, 5);
  saidLines.forEach((line, i) => {
    ctx.fillText(line, stageX + 26, cardsY + 104 + i * 46);
  });

  // REALITY box
  const rightX = stageX + colW + gap;
  ctx.fillStyle = palette.dark ? "#1D1010" : "#FFF3CD";
  ctx.fillRect(rightX, cardsY, colW, cardsH);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 5;
  ctx.strokeRect(rightX, cardsY, colW, cardsH);

  ctx.fillStyle = palette.accent;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.fillText("ACTUAL REALITY:", rightX + 26, cardsY + 48);

  ctx.fillStyle = palette.text;
  ctx.font = `800 34px ${fonts.body}`;
  const realLines = wrapLines(ctx, content.realityText, colW - 52, 5);
  realLines.forEach((line, i) => {
    ctx.fillText(line, rightX + 26, cardsY + 104 + i * 46);
  });
}

// ============================================================================
// FORMAT 2: LIVE TV BREAKING NEWS BROADCAST
// ============================================================================
function renderBreakingTV(
  ctx: CanvasRenderingContext2D,
  content: MemeContent,
  style: MemeStyleConfig,
  palette: MemePalette,
  siteTag: string,
  photo: HTMLImageElement | null
) {
  const fonts = getFonts(style.fontStyle);

  // Top broadcast frame
  const topH = 650;
  if (photo) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, MEME_WIDTH, topH);
    ctx.clip();
    drawImageCover(ctx, photo, 0, 0, MEME_WIDTH, topH);
    const fade = ctx.createLinearGradient(0, topH - 200, 0, topH);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, topH - 200, MEME_WIDTH, 200);
    ctx.restore();
  } else {
    // Dramatic newsroom studio backdrop when no photo uploaded
    const grad = ctx.createLinearGradient(0, 0, MEME_WIDTH, topH);
    grad.addColorStop(0, palette.bg);
    grad.addColorStop(1, palette.surface);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, MEME_WIDTH, topH);

    // Big studio quote / subject callout
    ctx.fillStyle = palette.muted;
    ctx.font = `700 26px ${fonts.mono}`;
    ctx.fillText(`SPECIAL REPORT  •  ${style.caseNumber}`, 64, 195);

    ctx.fillStyle = palette.text;
    ctx.font = `800 48px ${fonts.body}`;
    const subLines = wrapLines(ctx, content.subline, MEME_WIDTH - 128, 4);
    subLines.forEach((line, i) => {
      ctx.fillText(line, 64, 285 + i * 64);
    });

    ctx.fillStyle = palette.muted;
    ctx.font = `700 28px ${fonts.mono}`;
    ctx.fillText(`SUBJECT: ${(content.name || "ROHAN").toUpperCase()}`, 64, 575);
  }

  // Top-left LIVE bug
  ctx.fillStyle = "#FF2E2E";
  ctx.fillRect(48, 44, 150, 56);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 30px ${fonts.mono}`;
  ctx.fillText("● LIVE", 66, 83);

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(204, 44, 300, 56);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 26px ${fonts.mono}`;
  ctx.fillText("24/7 GROUP CHAT", 224, 82);

  // *** UNCROPPABLE SANDWICHED CHANNEL BAR (BETWEEN VISUAL AND HEADLINE) ***
  const barY = topH;
  const barH = 74;
  ctx.fillStyle = "#FF2E2E";
  ctx.fillRect(0, barY, MEME_WIDTH, barH);

  ctx.fillStyle = "#FFE600";
  ctx.fillRect(0, barY, 340, barH);
  ctx.fillStyle = "#0B0B0B";
  ctx.font = `900 36px ${fonts.display}`;
  ctx.fillText("BREAKING NEWS", 34, barY + 50);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 28px ${fonts.mono}`;
  ctx.textAlign = "right";
  ctx.fillText(`${siteTag}  |  LIVE DESK`, MEME_WIDTH - 44, barY + 47);
  ctx.textAlign = "left";

  // Main Lower-Third Headline Slab
  const slabY = barY + barH;
  const slabH = 366;
  ctx.fillStyle = "#FAF7F0";
  ctx.fillRect(0, slabY, MEME_WIDTH, slabH);

  ctx.fillStyle = "#0B0B0B";
  ctx.font = style.fontStyle === "brutal" ? `400 66px ${fonts.display}` : `800 56px ${fonts.display}`;
  const headLines = wrapLines(ctx, content.headline.toUpperCase(), MEME_WIDTH - 108, 4);
  headLines.forEach((line, i) => {
    ctx.fillText(line, 54, slabY + 90 + i * 74);
  });

  // Bottom Scrolling Ticker Strip
  const tickY = slabY + slabH;
  const tickH = MEME_HEIGHT - tickY;
  ctx.fillStyle = "#0B0B0B";
  ctx.fillRect(0, tickY, MEME_WIDTH, tickH);

  ctx.fillStyle = "#FFE600";
  ctx.fillRect(0, tickY, 210, tickH);
  ctx.fillStyle = "#0B0B0B";
  ctx.font = `800 26px ${fonts.mono}`;
  ctx.fillText("UPDATE", 48, tickY + 64);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 28px ${fonts.mono}`;
  const tickLines = wrapLines(ctx, content.tickerText, MEME_WIDTH - 255, 2);
  tickLines.forEach((line, i) => {
    ctx.fillText(line, 232, tickY + 46 + i * 36);
  });
}

// ============================================================================
// FORMAT 3: THERMAL UDHAAR / L RECEIPT
// ============================================================================
function renderThermalReceipt(
  ctx: CanvasRenderingContext2D,
  content: MemeContent,
  style: MemeStyleConfig,
  palette: MemePalette,
  siteTag: string
) {
  const fonts = getFonts("terminal");

  // Paper slip container with jagged top/bottom receipt teeth
  const slipX = 95;
  const slipY = 64;
  const slipW = MEME_WIDTH - 190;
  const slipH = MEME_HEIGHT - 128;

  // Hard offset shadow
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(slipX + 14, slipY + 14, slipW, slipH);

  ctx.fillStyle = palette.surface;
  ctx.fillRect(slipX, slipY, slipW, slipH);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 4;
  ctx.strokeRect(slipX, slipY, slipW, slipH);

  // Header
  ctx.fillStyle = palette.text;
  ctx.textAlign = "center";
  ctx.font = `800 44px ${fonts.mono}`;
  ctx.fillText("OFFICIAL L RECEIPT", MEME_WIDTH / 2, slipY + 86);

  ctx.fillStyle = palette.muted;
  ctx.font = `700 24px ${fonts.mono}`;
  ctx.fillText(
    `CUSTOMER: ${(content.name || "ROHAN").toUpperCase()}  •  ${style.caseNumber}`,
    MEME_WIDTH / 2,
    slipY + 132
  );
  ctx.textAlign = "left";

  // Dashed divider
  const drawDash = (y: number) => {
    ctx.save();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(slipX + 44, y);
    ctx.lineTo(slipX + slipW - 44, y);
    ctx.stroke();
    ctx.restore();
  };

  drawDash(slipY + 165);

  // Main Charge Summary
  ctx.fillStyle = palette.text;
  ctx.font = `700 30px ${fonts.body}`;
  const headLines = wrapLines(ctx, content.headline, slipW - 96, 3);
  headLines.forEach((line, i) => {
    ctx.fillText(line, slipX + 48, slipY + 220 + i * 42);
  });

  drawDash(slipY + 358);

  // Itemized L List
  const items = content.items.length ? content.items.slice(0, 4) : ["Zero accountability"];
  const prices = ["₹500", "-400 AURA", "99.9%", "MAX"];
  ctx.font = `700 25px ${fonts.mono}`;
  items.forEach((item, idx) => {
    const rowY = slipY + 422 + idx * 96;
    ctx.fillStyle = palette.text;
    const itemLines = wrapLines(ctx, `${idx + 1}. ${item}`, slipW - 260, 2);
    itemLines.forEach((l, li) => {
      ctx.fillText(l, slipX + 48, rowY + li * 34);
    });
    ctx.textAlign = "right";
    ctx.fillStyle = palette.accent;
    ctx.fillText(prices[idx % prices.length], slipX + slipW - 48, rowY);
    ctx.textAlign = "left";
  });

  // *** UNCROPPABLE SANDWICHED VERIFICATION STRIP (RIGHT ABOVE GRAND TOTAL) ***
  const verY = slipY + 802;
  ctx.fillStyle = palette.border;
  ctx.fillRect(slipX + 44, verY, slipW - 88, 52);
  ctx.fillStyle = palette.surface;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.textAlign = "center";
  ctx.fillText(`VERIFIED RECEIPT  //  ${siteTag}`, MEME_WIDTH / 2, verY + 34);
  ctx.textAlign = "left";

  // Grand Total Punchline
  ctx.fillStyle = palette.text;
  ctx.font = `900 54px "Anton", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(content.totalLabel.toUpperCase(), MEME_WIDTH / 2, verY + 130);

  // Fake Barcode
  const barStartX = slipX + 140;
  const barY = verY + 162;
  ctx.fillStyle = palette.text;
  let bx = barStartX;
  const widths = [6, 3, 10, 4, 8, 3, 12, 4, 6, 3, 9, 5, 4, 11, 3, 7, 5, 10, 4, 6, 8, 3, 9, 4, 7, 3, 11, 5, 6, 4];
  for (let i = 0; i < widths.length && bx < slipX + slipW - 140; i++) {
    ctx.fillRect(bx, barY, widths[i], 62);
    bx += widths[i] + (i % 2 === 0 ? 7 : 5);
  }
  ctx.textAlign = "left";
}

// ============================================================================
// FORMAT 4: CELEBRITY NOTES-APP PR APOLOGY
// ============================================================================
function renderPRApology(
  ctx: CanvasRenderingContext2D,
  content: MemeContent,
  style: MemeStyleConfig,
  palette: MemePalette,
  siteTag: string
) {
  const fonts = getFonts("editorial");

  // Fake iOS Notes top chrome
  ctx.fillStyle = palette.surface;
  ctx.fillRect(0, 0, MEME_WIDTH, 116);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 116);
  ctx.lineTo(MEME_WIDTH, 116);
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = `700 30px ${fonts.body}`;
  ctx.fillText("<  Notes", 54, 72);

  ctx.fillStyle = palette.muted;
  ctx.textAlign = "center";
  ctx.font = `600 24px ${fonts.mono}`;
  ctx.fillText("Today at 2:14 AM", MEME_WIDTH / 2, 70);

  ctx.fillStyle = palette.accent;
  ctx.textAlign = "right";
  ctx.font = `700 30px ${fonts.body}`;
  ctx.fillText("Done", MEME_WIDTH - 54, 72);
  ctx.textAlign = "left";

  // Statement Title
  ctx.fillStyle = palette.muted;
  ctx.font = `700 24px ${fonts.mono}`;
  ctx.fillText("PUBLIC STATEMENT", 74, 210);

  ctx.fillStyle = palette.text;
  ctx.font = `800 58px ${fonts.display}`;
  ctx.fillText(
    `An Apology From ${content.name || "Rohan"}`,
    74,
    284
  );

  // *** UNCROPPABLE SANDWICHED LETTERHEAD BAR (BETWEEN TITLE AND BODY) ***
  const refY = 324;
  ctx.fillStyle = palette.surface;
  ctx.fillRect(74, refY, MEME_WIDTH - 148, 56);
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(74, refY);
  ctx.lineTo(74, refY + 56);
  ctx.stroke();

  ctx.fillStyle = palette.muted;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.fillText(`REF: ${style.caseNumber}  •  FILED VIA ${siteTag}`, 98, refY + 36);

  // Headline trigger quote
  ctx.fillStyle = palette.accent;
  ctx.font = `700 30px ${fonts.body}`;
  const reLines = wrapLines(ctx, `RE: ${content.headline}`, MEME_WIDTH - 148, 2);
  reLines.forEach((line, i) => {
    ctx.fillText(line, 74, 444 + i * 42);
  });

  // Main Apology Body
  ctx.fillStyle = palette.text;
  ctx.font = `400 40px ${fonts.display}`;
  const bodyLines = wrapLines(ctx, content.apologyBody, MEME_WIDTH - 148, 8);
  bodyLines.forEach((line, i) => {
    ctx.fillText(line, 74, 576 + i * 56);
  });

  // Sign-off
  ctx.fillStyle = palette.muted;
  ctx.font = `italic 34px ${fonts.display}`;
  ctx.fillText(`— ${content.name || "Rohan"}'s PR Team (Literally just him)`, 74, 1085);
}

// ============================================================================
// FORMAT 5: LEAKED SEARCH / CHATGPT HISTORY
// ============================================================================
function renderSearchLeak(
  ctx: CanvasRenderingContext2D,
  content: MemeContent,
  style: MemeStyleConfig,
  palette: MemePalette,
  siteTag: string
) {
  const fonts = getFonts("clean");
  const pad = 64;
  const cardW = MEME_WIDTH - pad * 2;

  // Browser Window Chrome
  drawRoundedRect(ctx, pad, 76, cardW, MEME_HEIGHT - 152, 24);
  ctx.fillStyle = palette.surface;
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Traffic light dots
  const dotColors = ["#FF5F56", "#FFBD2E", "#27C93F"];
  dotColors.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(pad + 42 + i * 32, 122, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Top Header
  ctx.fillStyle = palette.muted;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.textAlign = "right";
  ctx.fillText("INCOGNITO RECOVERY // 3:14 AM", pad + cardW - 36, 130);
  ctx.textAlign = "left";

  // Account banner
  ctx.fillStyle = palette.text;
  ctx.font = `800 44px ${fonts.body}`;
  ctx.fillText(`${content.name || "Rohan"}'s Recent Activity`, pad + 42, 220);

  ctx.fillStyle = palette.muted;
  ctx.font = `600 26px ${fonts.body}`;
  const subLines = wrapLines(ctx, content.headline, cardW - 84, 2);
  subLines.forEach((l, i) => {
    ctx.fillText(l, pad + 42, 272 + i * 36);
  });

  const items = content.items.length >= 4
    ? content.items.slice(0, 4)
    : [
        ...content.items,
        "how to reply to hmm",
        "why did she leave me on seen",
      ].slice(0, 4);

  const times = ["3:14 AM", "3:11 AM", "2:58 AM", "2:42 AM"];

  const drawSearchRow = (text: string, time: string, y: number) => {
    drawRoundedRect(ctx, pad + 42, y, cardW - 84, 122, 14);
    ctx.fillStyle = palette.bg;
    ctx.fill();
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Magnifying dot
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(pad + 80, y + 61, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = palette.text;
    ctx.font = `700 31px ${fonts.body}`;
    const rowLines = wrapLines(ctx, text, cardW - 260, 2);
    rowLines.forEach((rl, i) => {
      ctx.fillText(rl, pad + 114, y + (rowLines.length > 1 ? 52 : 70) + i * 38);
    });

    ctx.fillStyle = palette.muted;
    ctx.font = `600 20px ${fonts.mono}`;
    ctx.textAlign = "right";
    ctx.fillText(time, pad + cardW - 68, y + 68);
    ctx.textAlign = "left";
  };

  // Top 2 searches
  drawSearchRow(items[0], times[0], 370);
  drawSearchRow(items[1], times[1], 516);

  // *** UNCROPPABLE SANDWICHED SYNC BAR (DEAD CENTER BETWEEN SEARCH #2 AND #3) ***
  const midY = 664;
  ctx.fillStyle = palette.accent;
  ctx.fillRect(pad + 42, midY, cardW - 84, 52);
  ctx.fillStyle = palette.accentText;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.textAlign = "center";
  ctx.fillText(
    `SYNCED HISTORY DUMP  •  ${siteTag}  •  ${style.caseNumber}`,
    MEME_WIDTH / 2,
    midY + 34
  );
  ctx.textAlign = "left";

  // Bottom 2 searches
  drawSearchRow(items[2], times[2], 742);
  drawSearchRow(items[3], times[3], 888);

  // Bottom subline
  ctx.fillStyle = palette.muted;
  ctx.font = `600 22px ${fonts.mono}`;
  ctx.textAlign = "center";
  ctx.fillText(content.subline.slice(0, 62), MEME_WIDTH / 2, 1068);
  ctx.textAlign = "left";
}

// ============================================================================
// FORMAT 6: GROUP CHAT POLL LANDSLIDE
// ============================================================================
function renderGroupPoll(
  ctx: CanvasRenderingContext2D,
  content: MemeContent,
  style: MemeStyleConfig,
  palette: MemePalette,
  siteTag: string
) {
  const fonts = getFonts("clean");
  const pad = 64;
  const bubbleW = MEME_WIDTH - pad * 2;

  // Fake chat group header
  ctx.fillStyle = palette.surface;
  ctx.fillRect(0, 0, MEME_WIDTH, 130);
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(88, 66, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.accentText;
  ctx.font = `800 26px ${fonts.mono}`;
  ctx.textAlign = "center";
  ctx.fillText("GC", 88, 76);
  ctx.textAlign = "left";

  ctx.fillStyle = palette.text;
  ctx.font = `800 34px ${fonts.body}`;
  ctx.fillText("Main Group Chat", 146, 62);
  ctx.fillStyle = palette.muted;
  ctx.font = `600 22px ${fonts.body}`;
  ctx.fillText("Kabir, Priya, Dev, You, +8 others", 146, 98);

  // Main Poll Bubble
  drawRoundedRect(ctx, pad, 184, bubbleW, 930, 26);
  ctx.fillStyle = palette.surface;
  ctx.fill();
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.fillText("ANONYMOUS GROUP POLL", pad + 44, 244);

  // Poll Question
  ctx.fillStyle = palette.text;
  ctx.font = `800 44px ${fonts.body}`;
  const qLines = wrapLines(ctx, content.headline, bubbleW - 88, 3);
  qLines.forEach((line, i) => {
    ctx.fillText(line, pad + 44, 312 + i * 54);
  });

  // *** UNCROPPABLE SANDWICHED POLL METADATA BAR (BETWEEN QUESTION AND VOTES) ***
  const metaY = 490;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(pad + 44, metaY, bubbleW - 88, 54);
  ctx.fillStyle = palette.accent;
  ctx.font = `700 22px ${fonts.mono}`;
  ctx.fillText(`14 / 14 VOTED  •  ${siteTag}`, pad + 68, metaY + 35);
  ctx.fillStyle = palette.muted;
  ctx.textAlign = "right";
  ctx.fillText("CLOSED", pad + bubbleW - 68, metaY + 35);
  ctx.textAlign = "left";

  // Poll Bars (Landslide Winner = Option 1)
  const opts = [
    { label: `${content.name || "Rohan"} (100% guilty)`, pct: 92, votes: "13 votes", winner: true },
    { label: content.items[1] || "Definitely still him", pct: 8, votes: "1 vote", winner: false },
    { label: content.items[2] || "Someone else in this chat", pct: 0, votes: "0 votes", winner: false },
  ];

  opts.forEach((opt, idx) => {
    const oy = 590 + idx * 146;
    ctx.fillStyle = palette.text;
    ctx.font = `700 30px ${fonts.body}`;
    ctx.fillText(opt.label.slice(0, 38), pad + 44, oy);

    ctx.textAlign = "right";
    ctx.fillStyle = opt.winner ? palette.accent : palette.muted;
    ctx.font = `700 24px ${fonts.mono}`;
    ctx.fillText(opt.votes, pad + bubbleW - 44, oy);
    ctx.textAlign = "left";

    // Track
    const trackW = bubbleW - 88;
    drawRoundedRect(ctx, pad + 44, oy + 22, trackW, 42, 12);
    ctx.fillStyle = palette.bg;
    ctx.fill();

    // Fill
    if (opt.pct > 0) {
      drawRoundedRect(ctx, pad + 44, oy + 22, Math.max(46, (trackW * opt.pct) / 100), 42, 12);
      ctx.fillStyle = opt.winner ? palette.accent : palette.muted;
      ctx.fill();
    }
  });

  // Footer note
  ctx.fillStyle = palette.muted;
  ctx.font = `600 24px ${fonts.body}`;
  ctx.textAlign = "center";
  ctx.fillText(content.subline.slice(0, 60), MEME_WIDTH / 2, 1068);
  ctx.textAlign = "left";
}

// ============================================================================
// MAIN ENTRYPOINT + CLIPBOARD / NATIVE SHARE / DOWNLOAD HELPERS
// ============================================================================
export function renderMemeToCanvas(
  canvas: HTMLCanvasElement,
  content: MemeContent,
  style: MemeStyleConfig,
  options: RenderMemeOptions = {}
) {
  canvas.width = MEME_WIDTH;
  canvas.height = MEME_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const palette = getPaletteById(style.paletteId);
  const siteTag = getCleanSiteTag(options.siteTag);
  const photo = options.photo ?? null;

  // Base background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, MEME_WIDTH, MEME_HEIGHT);

  // Surface texture
  drawTexture(ctx, style.texture, palette);

  // Format-specific layout
  switch (style.format) {
    case "breaking_tv":
      renderBreakingTV(ctx, content, style, palette, siteTag, photo);
      break;
    case "thermal_receipt":
      renderThermalReceipt(ctx, content, style, palette, siteTag);
      break;
    case "pr_apology":
      renderPRApology(ctx, content, style, palette, siteTag);
      break;
    case "search_leak":
      renderSearchLeak(ctx, content, style, palette, siteTag);
      break;
    case "group_poll":
      renderGroupPoll(ctx, content, style, palette, siteTag);
      break;
    case "viewfinder_4k":
    default:
      renderViewfinder4K(ctx, content, style, palette, siteTag, photo);
      break;
  }

  // Optional rubber stamp
  drawStamp(ctx, style, palette);
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = String(reader.result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
  });
}

export async function copyMemeToClipboard(
  canvas: HTMLCanvasElement
): Promise<"copied" | "unsupported"> {
  if (
    typeof navigator === "undefined" ||
    !navigator.clipboard ||
    typeof ClipboardItem === "undefined"
  ) {
    return "unsupported";
  }
  const blob = await canvasToBlob(canvas);
  if (!blob) return "unsupported";
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return "copied";
  } catch {
    return "unsupported";
  }
}

export async function shareOrDownloadMeme(
  canvas: HTMLCanvasElement,
  victimName: string,
  formatId: string
): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await canvasToBlob(canvas);
  if (!blob) return "failed";

  const clean = victimName.toLowerCase().replace(/[^a-z0-9]/g, "") || "friend";
  const fileName = `${formatId}-${clean}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: `Caught in 4K — ${victimName}`,
      });
      return "shared";
    } catch {
      // Fall back to direct download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return "downloaded";
}
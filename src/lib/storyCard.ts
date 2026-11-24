// src/lib/storyCard.ts

export interface StoryCardData {
  victimName: string;
  headline: string;
  reactionSeconds: number;
  gullibilityPercent: number;
  verdictTitle: string;
  chainCount: number;
  senderName?: string;
  siteHost: string;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines - 1) break;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

export async function generateStoryCardBlob(data: StoryCardData): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background
  ctx.fillStyle = "#0B0B0B";
  ctx.fillRect(0, 0, 1080, 1920);

  // Halftone dot pattern
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let x = 24; x < 1080; x += 36) {
    for (let y = 24; y < 1920; y += 36) {
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Camera viewfinder corners
  ctx.strokeStyle = "#FF2E2E";
  ctx.lineWidth = 10;
  const pad = 64;
  const arm = 72;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad, pad + arm);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + arm, pad);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(1080 - pad - arm, pad);
  ctx.lineTo(1080 - pad, pad);
  ctx.lineTo(1080 - pad, pad + arm);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad, 1920 - pad - arm);
  ctx.lineTo(pad, 1920 - pad);
  ctx.lineTo(pad + arm, 1920 - pad);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(1080 - pad - arm, 1920 - pad);
  ctx.lineTo(1080 - pad, 1920 - pad);
  ctx.lineTo(1080 - pad, 1920 - pad - arm);
  ctx.stroke();

  // Top REC badge
  ctx.fillStyle = "#FF2E2E";
  ctx.beginPath();
  ctx.arc(130, 150, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 34px monospace";
  ctx.fillText("REC // 4K ULTRA HD", 165, 162);

  ctx.fillStyle = "#FFE600";
  ctx.font = "700 32px monospace";
  ctx.textAlign = "right";
  ctx.fillText(`CHAIN #${data.chainCount}`, 960, 162);
  ctx.textAlign = "left";

  // Main slanted CAUGHT IN 4K banner
  ctx.save();
  ctx.translate(540, 390);
  ctx.rotate(-0.04);
  ctx.fillStyle = "#000000";
  ctx.fillRect(-455 + 16, -125 + 16, 910, 240);
  ctx.fillStyle = "#FF2E2E";
  ctx.fillRect(-455, -125, 910, 240);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 8;
  ctx.strokeRect(-455, -125, 910, 240);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 132px Impact, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CAUGHT IN 4K", 0, 46);
  ctx.restore();
  ctx.textAlign = "left";

  // White brutalist receipt card
  const cardX = 95;
  const cardY = 610;
  const cardW = 890;
  const cardH = 820;

  // Hard yellow offset shadow
  ctx.fillStyle = "#FFE600";
  ctx.fillRect(cardX + 18, cardY + 18, cardW, cardH);

  // Cream card body
  ctx.fillStyle = "#FAF7F0";
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = "#0B0B0B";
  ctx.lineWidth = 8;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // Victim pill
  ctx.fillStyle = "#0B0B0B";
  ctx.fillRect(cardX + 48, cardY + 54, 794, 86);
  ctx.fillStyle = "#FFE600";
  ctx.font = "700 36px monospace";
  ctx.fillText(`VICTIM: ${data.victimName.toUpperCase()}`, cardX + 76, cardY + 109);

  // Headline fallen for
  ctx.fillStyle = "#666666";
  ctx.font = "700 26px monospace";
  ctx.fillText("FELL FOR THIS HEADLINE:", cardX + 48, cardY + 204);

  ctx.fillStyle = "#0B0B0B";
  ctx.font = "800 46px Georgia, serif";
  const lines = wrapText(ctx, `"${data.headline}"`, 790, 4);
  lines.forEach((line, idx) => {
    ctx.fillText(line, cardX + 48, cardY + 272 + idx * 62);
  });

  // Divider
  ctx.strokeStyle = "#0B0B0B";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(cardX + 48, cardY + 555);
  ctx.lineTo(cardX + cardW - 48, cardY + 555);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2 Stat Boxes
  const statY = cardY + 595;
  // Reaction Time
  ctx.fillStyle = "#FFE600";
  ctx.fillRect(cardX + 48, statY, 375, 165);
  ctx.strokeStyle = "#0B0B0B";
  ctx.lineWidth = 5;
  ctx.strokeRect(cardX + 48, statY, 375, 165);

  ctx.fillStyle = "#0B0B0B";
  ctx.font = "700 24px monospace";
  ctx.fillText("CLICKED IN", cardX + 74, statY + 46);
  ctx.font = "900 72px Impact, Arial Black, sans-serif";
  ctx.fillText(`${data.reactionSeconds.toFixed(1)}s`, cardX + 74, statY + 132);

  // Gullibility Score
  ctx.fillStyle = "#FF2E2E";
  ctx.fillRect(cardX + 467, statY, 375, 165);
  ctx.strokeRect(cardX + 467, statY, 375, 165);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 24px monospace";
  ctx.fillText("GULLIBILITY", cardX + 493, statY + 46);
  ctx.font = "900 72px Impact, Arial Black, sans-serif";
  ctx.fillText(`${data.gullibilityPercent}%`, cardX + 493, statY + 132);

  // Verdict badge below card
  ctx.fillStyle = "#FFE600";
  ctx.font = "900 48px Impact, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`RANK: ${data.verdictTitle}`, 540, 1545);

  if (data.senderName) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 32px monospace";
    ctx.fillText(`SET UP BY: ${data.senderName.toUpperCase()}`, 540, 1610);
  }

  // Footer viral stamp
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "700 28px monospace";
  ctx.fillText("PRANK YOUR GROUP CHAT AT", 540, 1735);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 44px monospace";
  ctx.fillText(data.siteHost.toUpperCase(), 540, 1795);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
  });
}

export async function shareOrDownloadStoryCard(data: StoryCardData): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await generateStoryCardBlob(data);
  if (!blob) return "failed";

  const fileName = `caught-4k-${data.victimName.toLowerCase().replace(/[^a-z0-9]/g, "") || "victim"}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  // Mobile native share sheet (WhatsApp Status / Instagram Stories / Snap)
  if (
    typeof navigator !== "undefined" &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: `CAUGHT IN 4K — ${data.victimName}`,
        text: `Fell for it in ${data.reactionSeconds.toFixed(1)}s 💀`,
      });
      return "shared";
    } catch {
      // User closed share sheet -> fall back to download
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
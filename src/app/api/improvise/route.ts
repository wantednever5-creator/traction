// src/app/api/improvise/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { MemeFormatId } from "@/lib/memeTemplates";

const REDDIT_RSS_FEEDS = [
  "https://www.reddit.com/r/BrandNewSentence/hot/.rss?limit=8",
  "https://www.reddit.com/r/rareinsults/hot/.rss?limit=8",
  "https://www.reddit.com/r/indianmemer/hot/.rss?limit=8",
  "https://www.reddit.com/r/me_irl/hot/.rss?limit=8",
];

// Lightweight RSS title extractor (anonymous .json is blocked on cloud IPs, RSS stays fast)
async function fetchRedditToneSamples(lang: string): Promise<string[]> {
  const chosenFeeds =
    lang === "hi"
      ? [REDDIT_RSS_FEEDS[2], REDDIT_RSS_FEEDS[0]]
      : lang === "en"
      ? [REDDIT_RSS_FEEDS[0], REDDIT_RSS_FEEDS[1]]
      : [REDDIT_RSS_FEEDS[2], REDDIT_RSS_FEEDS[1]];

  const titles: string[] = [];

  await Promise.allSettled(
    chosenFeeds.map(async (url) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2200);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "web:dispatch-meme-studio:v1.0 (rss-reader)",
            Accept: "application/atom+xml, application/xml, text/xml",
          },
          cache: "no-store",
        });
        if (!res.ok) return;
        const xml = await res.text();
        const matches = [...xml.matchAll(/<entry>[\s\S]*?<title>([\s\S]*?)<\/title>/g)];
        for (const m of matches.slice(0, 5)) {
          const clean = m[1]
            .replace(/&/g, "&")
            .replace(/"/g, '"')
            .replace(/'/g, "'")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .trim();
          if (clean.length > 14 && clean.length < 130) {
            titles.push(clean);
          }
        }
      } catch {
        // Ignore timeout/network blocks cleanly
      } finally {
        clearTimeout(timeout);
      }
    })
  );

  return titles.slice(0, 6);
}

function buildLocalFallback(
  name: string,
  draft: string,
  lang: string,
  brutal: boolean
) {
  const n = name || "Rohan";
  const seed = draft.trim() || `${n} caught lying in broad daylight`;
  const hi = lang === "hi" || (lang === "mix" && Math.random() < 0.55);

  if (hi) {
    return {
      headline: brutal
        ? `${n} ko laga koi notice nahi karega — ${seed}`
        : `${n} caught lying in broad daylight: ${seed}`,
      subline: brutal
        ? "Sabko pehle se pata tha, bas bol koi nahi raha tha."
        : "Group chat mein screenshots aa chuke hain.",
      saidText: `"Bhai bas 5 minute mein nikal raha hoon, pakka."`,
      realityText: `Abhi tak bistar se utha bhi nahi hai.`,
      tickerText: `LIVE: ${n.toUpperCase()} NE PHIR SE BAHANA MAAR DIYA  •  ₹500 UDHAAR ABHI BHI PENDING  •  SEEN AT 11:04 PM`,
      items: [
        seed.slice(0, 42),
        `Phone silent pe tha (3 ghante reels)`,
        `Last minute plan cancel tax`,
        `Zero accountability surcharge`,
      ],
      totalLabel: "TOTAL: SHAMELESS",
      apologyBody: `Kal raat jo hua uske liye main kisi hacker ko blame nahi karunga. ${seed}. Main agle weekend phir se same galti karne wala hoon, kripya mujhe judge na karein.`,
    };
  }

  return {
    headline: brutal
      ? `${n} really thought nobody noticed — ${seed}`
      : `Caught in broad daylight: ${seed}`,
    subline: brutal
      ? "Everyone in the chat saw it and quietly stayed silent."
      : "Receipts already made it to the group chat.",
    saidText: `"I'm literally 5 minutes away, just parking."`,
    realityText: `Still sitting on the edge of the bed in a towel.`,
    tickerText: `DEVELOPING: ${n.toUpperCase()} STILL OWES SPLIT MONEY  •  MUTED THE CHAT TO AVOID QUESTIONS  •  NO RECOVERY EXPECTED`,
    items: [
      seed.slice(0, 42),
      `"Sorry crazy week" (6h screen time)`,
      `Cancelled plans 20 mins before`,
      `Left on seen for 4 business days`,
    ],
    totalLabel: "TOTAL: ZERO SHAME",
    apologyBody: `I am writing this statement to address recent screenshots involving ${n}. ${seed}. I have learned nothing from this and will almost certainly do it again by Friday.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "Rohan").trim().slice(0, 28);
    const draft = String(body.draft || "").trim().slice(0, 180);
    const format = (String(body.format || "viewfinder_4k") as MemeFormatId);
    const lang = String(body.lang || "mix"); // mix | hi | en
    const brutal = Boolean(body.brutal);

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";

    if (!apiKey || apiKey.includes("PASTE_YOUR")) {
      return NextResponse.json({
        ...buildLocalFallback(name, draft, lang, brutal),
        source: "local-no-key",
      });
    }

    const redditSamples = await fetchRedditToneSamples(lang);
    const redditContext =
      redditSamples.length > 0
        ? `REAL REDDIT POST TITLES (absorb ONLY the dry, blunt, human cadence—never copy them verbatim):\n- ${redditSamples.join("\n- ")}`
        : "Use dry, blunt r/RoastMe and Delhi/Indian WhatsApp group chat cadence.";

    const langRule =
      lang === "hi"
        ? "Write in natural Delhi/Indian Hinglish (Roman script, NEVER Devanagari). Like how 18-25yo friends roast each other on WhatsApp."
        : lang === "en"
        ? "Write in sharp, deadpan English like top r/RoastMe or Twitter replies."
        : "Mix sharp English with natural Hinglish where it hits harder (Roman script only, never Devanagari).";

    const spiceRule = brutal
      ? "Tone: cold, painfully accurate, dry brutal truth that stings in a friend group (never hate speech or slurs, just surgical ego damage)."
      : "Tone: deadpan, painfully specific everyday embarrassment between close friends.";

    const prompt = `You are a blunt human meme editor sharpening a friend-group roast for "${name}".
User's raw idea/headline: "${draft || `${name} caught lying in broad daylight`}"
Active visual template: "${format}"

${redditContext}

STRICT ANTI-AI-HUMOR RULES (MANDATORY):
1. NEVER use corny AI jokes, puns, rhymes, dad jokes, or cartoon clichés.
2. BANNED WORDS/TROPES: "guardian angel", "Mercury retrograde", "main character", "plot twist", "spoiler alert", "legend has it", "shenanigans", "oops", "busted!", "uh oh", "chef's kiss", "epic fail", "vibes", exclamation-mark spam, or cringe emojis.
3. Keep the user's core premise intact if they wrote one—just make it punchier, more specific, and funnier like a real person roasting their best friend.
4. ${langRule}
5. ${spiceRule}

Return ONLY valid JSON with these exact keys (all concise so they fit cleanly on a 1080px meme graphic):
{
  "headline": "Main punchy line mentioning ${name} (max 110 chars)",
  "subline": "Dry 1-line follow-up detail (max 95 chars)",
  "saidText": "What ${name} claimed in quotes (max 65 chars)",
  "realityText": "What actually happened (max 65 chars)",
  "tickerText": "ALL CAPS TV news bottom ticker with 2 short updates separated by • (max 125 chars)",
  "items": ["4 short punchy lines for a receipt/search history/poll — each max 44 chars"],
  "totalLabel": "Short deadpan receipt total line like 'TOTAL: SHAMELESS' (max 28 chars)",
  "apologyBody": "Deadpan 2-3 sentence celebrity Notes-app PR apology written from ${name}'s POV (max 240 chars)"
}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const aiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "");
      console.error("[improvise] Gemini error:", aiRes.status, errText.slice(0, 220));
      return NextResponse.json({
        ...buildLocalFallback(name, draft, lang, brutal),
        source: "fallback-error",
      });
    }

    const data = await aiRes.json();
    const rawText: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    const fallback = buildLocalFallback(name, draft, lang, brutal);

    return NextResponse.json({
      headline: typeof parsed.headline === "string" && parsed.headline.trim() ? parsed.headline.trim() : fallback.headline,
      subline: typeof parsed.subline === "string" && parsed.subline.trim() ? parsed.subline.trim() : fallback.subline,
      saidText: typeof parsed.saidText === "string" && parsed.saidText.trim() ? parsed.saidText.trim() : fallback.saidText,
      realityText: typeof parsed.realityText === "string" && parsed.realityText.trim() ? parsed.realityText.trim() : fallback.realityText,
      tickerText: typeof parsed.tickerText === "string" && parsed.tickerText.trim() ? parsed.tickerText.trim() : fallback.tickerText,
      items:
        Array.isArray(parsed.items) && parsed.items.length >= 3
          ? parsed.items.slice(0, 4).map((x: unknown) => String(x).slice(0, 52))
          : fallback.items,
      totalLabel: typeof parsed.totalLabel === "string" && parsed.totalLabel.trim() ? parsed.totalLabel.trim() : fallback.totalLabel,
      apologyBody: typeof parsed.apologyBody === "string" && parsed.apologyBody.trim() ? parsed.apologyBody.trim() : fallback.apologyBody,
      source: redditSamples.length > 0 ? "reddit+gemini" : "gemini",
    });
  } catch (err) {
    console.error("[improvise] unexpected error:", err);
    return NextResponse.json(
      buildLocalFallback("Rohan", "", "mix", false),
      { status: 200 }
    );
  }
}
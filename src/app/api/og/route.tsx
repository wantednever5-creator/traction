// src/app/api/og/route.tsx
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "BREAKING: Live update just dropped").slice(0, 125);
  const tag = (searchParams.get("tag") || "BREAKING").slice(0, 24).toUpperCase();
  const mode = searchParams.get("mode") || "news";
  const name = (searchParams.get("name") || "LIVE").slice(0, 26);
  const dark = searchParams.get("dark") === "1";

  const isGift = mode === "gift";
  const isLeak = mode === "leak" || dark;

  const bgColor = isGift ? "#FFE600" : isLeak ? "#0B0B0B" : "#FAF7F0";
  const textColor = isLeak ? "#FAF7F0" : "#0B0B0B";
  const accentBg = isGift ? "#0B0B0B" : "#FF2E2E";
  const accentText = isGift ? "#FFE600" : "#FFFFFF";
  const borderColor = isLeak ? "#FF2E2E" : "#0B0B0B";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: bgColor,
          color: textColor,
          padding: "52px 60px",
          border: `16px solid ${borderColor}`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Masthead */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `4px solid ${isLeak ? "#333333" : "#0B0B0B"}`,
            paddingBottom: "22px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: accentBg,
                color: accentText,
                padding: "10px 22px",
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.08em",
              }}
            >
              {tag}
            </div>
            <div
              style={{
                marginLeft: "22px",
                fontSize: "26px",
                fontWeight: 700,
                opacity: 0.75,
                letterSpacing: "0.06em",
              }}
            >
              {isGift
                ? "PRIVATE DELIVERY"
                : isLeak
                ? "ENCRYPTED ARCHIVE // 4K"
                : "THE DAILY DISPATCH"}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "24px",
              fontWeight: 800,
              color: isLeak ? "#FFE600" : "#FF2E2E",
            }}
          >
            {isGift ? `FOR: ${name.toUpperCase()}` : "● LIVE NOW"}
          </div>
        </div>

        {/* Main Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
            paddingTop: "18px",
            paddingBottom: "18px",
          }}
        >
          <div
            style={{
              fontSize: title.length > 88 ? "48px" : title.length > 62 ? "56px" : "64px",
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom CTA Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `4px solid ${isLeak ? "#333333" : "#0B0B0B"}`,
            paddingTop: "22px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 700,
              opacity: 0.72,
            }}
          >
            {isGift
              ? "Verified gift drop — expires in 10 mins"
              : isLeak
              ? "3 screenshots + transcript attached • expires soon"
              : "14,209 people reading right now • Updated 2m ago"}
          </div>

          <div
            style={{
              backgroundColor: isLeak ? "#FFE600" : "#0B0B0B",
              color: isLeak ? "#0B0B0B" : "#FFFFFF",
              padding: "12px 26px",
              fontSize: "24px",
              fontWeight: 900,
              letterSpacing: "0.06em",
            }}
          >
            {isGift ? "OPEN NOW →" : isLeak ? "VIEW LEAK →" : "READ FULL →"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
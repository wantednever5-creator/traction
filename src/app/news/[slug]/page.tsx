// src/app/news/[slug]/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  decodeBaitSlug,
  formatHeadline,
  getPresetMeta,
} from "@/lib/prankEngine";
import PrankTrapClient from "@/components/PrankTrapClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const payload = decodeBaitSlug(slug, "news");
  const headline = formatHeadline(payload);
  const meta = getPresetMeta(payload);

  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const ogUrl = `${proto}://${host}/api/og?title=${encodeURIComponent(
    headline
  )}&tag=${encodeURIComponent(meta.tag)}&mode=news&name=${encodeURIComponent(
    payload.name
  )}&dark=${payload.spice === "dark" ? "1" : "0"}`;

  return {
    title: `${headline} | The Daily Dispatch`,
    description: meta.subhead,
    openGraph: {
      title: headline,
      description: meta.subhead,
      type: "article",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: headline }],
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description: meta.subhead,
      images: [ogUrl],
    },
  };
}

export default async function NewsBaitPage({ params }: Props) {
  const { slug } = await params;
  const payload = decodeBaitSlug(slug, "news");
  return <PrankTrapClient payload={payload} />;
}
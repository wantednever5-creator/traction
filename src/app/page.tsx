// src/app/page.tsx
import CreatorStudio from "@/components/CreatorStudio";

type HomeProps = {
  searchParams: Promise<{ chain?: string; from?: string }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const parsedChain = Number(params.chain);
  const initialChain =
    Number.isFinite(parsedChain) && parsedChain > 1
      ? Math.min(99999, Math.floor(parsedChain))
      : 1;
  const initialSender =
    typeof params.from === "string" ? params.from.slice(0, 24) : "";

  return (
    <CreatorStudio
      initialChain={initialChain}
      initialSender={initialSender}
    />
  );
}
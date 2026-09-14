import type { ReactNode } from "react";

function renderInline(text: string, key: number): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <span key={key}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function formatAnswer(raw: string): ReactNode {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let key = 0;

  const flushList = () => {
    if (listBuffer.length === 0 || !listType) return;
    const items = listBuffer.map((item, i) => (
      <li key={i}>{renderInline(item, i)}</li>
    ));
    blocks.push(
      listType === "ul" ? (
        <ul key={key++} className="list-disc">
          {items}
        </ul>
      ) : (
        <ol key={key++} className="list-decimal">
          {items}
        </ol>
      )
    );
    listBuffer = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    const bulletMatch = line.match(/^[-*•]\s+(.*)/);
    const numberedMatch = line.match(/^\d+[.)]\s+(.*)/);
    const headingMatch = line.match(/^(#{1,3})\s+(.*)/);

    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = renderInline(headingMatch[2], key);
      if (level === 1) blocks.push(<h1 key={key++}>{content}</h1>);
      else if (level === 2) blocks.push(<h2 key={key++}>{content}</h2>);
      else blocks.push(<h3 key={key++}>{content}</h3>);
      continue;
    }

    if (bulletMatch) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuffer.push(bulletMatch[1]);
      continue;
    }

    if (numberedMatch) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuffer.push(numberedMatch[1]);
      continue;
    }

    flushList();
    blocks.push(<p key={key++}>{renderInline(line, key)}</p>);
  }
  flushList();

  return blocks;
}

export function stripMarkdownForSpeech(raw: string): string {
  return raw
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .trim();
}

import React from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, AlertCircle, CheckCircle2, Lightbulb, Info, Star } from "lucide-react";

// Detect special block types from markdown content
function parseContentBlocks(content) {
  if (!content) return [{ type: "markdown", content: "Content coming soon..." }];

  const lines = content.split("\n");
  const blocks = [];
  let buffer = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect callout blocks: > [!NOTE], > [!WARNING], > [!TIP], > [!IMPORTANT]
    if (/^>\s*\[!(NOTE|WARNING|TIP|IMPORTANT|KEY)\]/i.test(line)) {
      if (buffer.length) { blocks.push({ type: "markdown", content: buffer.join("\n") }); buffer = []; }
      const typeMatch = line.match(/\[!(\w+)\]/i);
      const calloutType = typeMatch?.[1]?.toUpperCase() || "NOTE";
      const calloutLines = [];
      i++;
      while (i < lines.length && lines[i].startsWith(">")) {
        calloutLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "callout", calloutType, content: calloutLines.join("\n") });
      continue;
    }

    // Detect "---" section dividers with a heading after
    if (line.trim() === "---" && lines[i + 1]?.startsWith("##")) {
      if (buffer.length) { blocks.push({ type: "markdown", content: buffer.join("\n") }); buffer = []; }
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    buffer.push(line);
    i++;
  }

  if (buffer.length) blocks.push({ type: "markdown", content: buffer.join("\n") });
  return blocks;
}

const calloutConfig = {
  NOTE: { icon: Info, bg: "bg-blue-50", border: "border-blue-200", title: "text-blue-800", body: "text-blue-700", iconColor: "text-blue-500", label: "Note" },
  TIP: { icon: Lightbulb, bg: "bg-amber-50", border: "border-amber-200", title: "text-amber-800", body: "text-amber-700", iconColor: "text-amber-500", label: "Tip" },
  WARNING: { icon: AlertCircle, bg: "bg-red-50", border: "border-red-200", title: "text-red-800", body: "text-red-700", iconColor: "text-red-500", label: "Warning" },
  IMPORTANT: { icon: Star, bg: "bg-teal-50", border: "border-teal-200", title: "text-teal-800", body: "text-teal-700", iconColor: "text-teal-500", label: "Important" },
  KEY: { icon: CheckCircle2, bg: "bg-green-50", border: "border-green-200", title: "text-green-800", body: "text-green-700", iconColor: "text-green-500", label: "Key Point" },
};

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-800 mt-8 mb-3 pb-2 border-b border-slate-100">{children}</h1>
  ),
  h2: ({ children }) => (
    <div className="flex items-center gap-2 mt-8 mb-3">
      <div className="w-1 h-6 bg-teal-500 rounded-full flex-shrink-0" />
      <h2 className="text-lg font-bold text-slate-800">{children}</h2>
    </div>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-slate-700 mt-6 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="space-y-2 mb-4 ml-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-slate-600">
      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0 mt-2" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-800">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-600">{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-teal-400 pl-4 py-2 my-4 bg-teal-50/50 rounded-r-lg text-slate-600 italic">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
    ) : (
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-4 text-sm font-mono">
        <code>{children}</code>
      </pre>
    ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-teal-50">{children}</thead>,
  th: ({ children }) => (
    <th className="px-4 py-2 text-left font-semibold text-teal-800 border border-slate-200">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-slate-600 border border-slate-200">{children}</td>
  ),
  tr: ({ children }) => <tr className="even:bg-slate-50">{children}</tr>,
  hr: () => <hr className="my-6 border-slate-200" />,
};

export default function LessonContentRenderer({ content }) {
  const blocks = parseContentBlocks(content);

  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        if (block.type === "divider") {
          return <hr key={idx} className="my-6 border-dashed border-slate-200" />;
        }

        if (block.type === "callout") {
          const cfg = calloutConfig[block.calloutType] || calloutConfig.NOTE;
          const Icon = cfg.icon;
          return (
            <div key={idx} className={`rounded-xl border p-4 my-4 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                <span className={`text-xs font-bold uppercase tracking-wide ${cfg.title}`}>{cfg.label}</span>
              </div>
              <div className={`text-sm leading-relaxed ${cfg.body}`}>
                <ReactMarkdown components={{
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                }}>
                  {block.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        // Default: styled markdown
        return (
          <div key={idx}>
            <ReactMarkdown components={markdownComponents}>
              {block.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
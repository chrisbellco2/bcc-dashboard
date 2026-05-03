"use client";

import ReactMarkdown from "react-markdown";

type NoteMarkdownProps = {
  content: string;
};

export default function NoteMarkdown({ content }: NoteMarkdownProps) {
  return (
    <div
      className={
        "max-w-none text-sm leading-relaxed text-stone-800 " +
        "[&_p]:mb-2 [&_p:last-child]:mb-0 " +
        "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:text-stone-900 " +
        "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-stone-900 " +
        "[&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-stone-900 " +
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 " +
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 " +
        "[&_li]:mb-1 " +
        "[&_strong]:font-semibold [&_em]:italic " +
        "[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-300 [&_blockquote]:pl-3 [&_blockquote]:text-stone-600 " +
        "[&_a]:font-medium [&_a]:text-amber-900 [&_a]:underline hover:[&_a]:text-amber-950 " +
        "[&_code]:rounded [&_code]:bg-stone-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] " +
        "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-stone-100 [&_pre]:p-3 [&_pre]:text-xs [&_pre]:font-mono " +
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
        "[&_hr]:my-4 [&_hr]:border-stone-200"
      }
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { Markdown } from "@tiptap/markdown";

const NOTE_TYPES = ["Meeting", "Phone", "Email", "Text", "Zoom", "Internal"] as const;
const AUTHORS = ["Chris", "Gav"] as const;

type AddNoteFormProps = {
  studentId: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function ToolbarButton({
  label,
  onClick,
  isActive,
}: {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
        isActive
          ? "border-amber-500 bg-amber-100 text-amber-900"
          : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function AddNoteForm({ studentId }: AddNoteFormProps) {
  const router = useRouter();
  const [noteDate, setNoteDate] = useState(todayIsoDate());
  const [noteType, setNoteType] = useState<(typeof NOTE_TYPES)[number]>("Meeting");
  const [author, setAuthor] = useState<(typeof AUTHORS)[number]>("Chris");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Highlight,
      Typography,
      Markdown,
    ],
    content: "",
    contentType: "markdown",
    editorProps: {
      attributes: {
        class:
          "min-h-[22rem] w-full rounded-b-lg bg-white px-3 py-3 text-sm leading-6 text-stone-800 focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) {
      return;
    }

    const text = editor.getText().trim();
    if (!text) {
      setErrorMessage("Note content is required.");
      return;
    }

    const markdown = editor.getMarkdown().trim();

    setIsSaving(true);
    setErrorMessage(null);

    const response = await fetch("/api/notes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        note_date: noteDate,
        note_type: noteType,
        author,
        raw_content: markdown,
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setErrorMessage(result?.error ?? "Unable to save note.");
      setIsSaving(false);
      return;
    }

    router.push(`/students/${studentId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="note_date" className="mb-1 block text-sm font-medium text-stone-700">
            Note Date
          </label>
          <input
            id="note_date"
            type="date"
            value={noteDate}
            onChange={(event) => setNoteDate(event.target.value)}
            required
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800"
          />
        </div>

        <div>
          <label htmlFor="note_type" className="mb-1 block text-sm font-medium text-stone-700">
            Note Type
          </label>
          <select
            id="note_type"
            required
            value={noteType}
            onChange={(event) => setNoteType(event.target.value as (typeof NOTE_TYPES)[number])}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800"
          >
            {NOTE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="author" className="mb-1 block text-sm font-medium text-stone-700">
            Author
          </label>
          <select
            id="author"
            required
            value={author}
            onChange={(event) => setAuthor(event.target.value as (typeof AUTHORS)[number])}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800"
          >
            {AUTHORS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-stone-700">Note Content</label>
        <div className="rounded-lg border border-stone-300 bg-white">
          <div className="flex flex-wrap gap-2 border-b border-stone-200 bg-stone-50 px-3 py-2">
            <ToolbarButton
              label="B"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              isActive={editor?.isActive("bold")}
            />
            <ToolbarButton
              label="I"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              isActive={editor?.isActive("italic")}
            />
            <ToolbarButton
              label="U"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              isActive={editor?.isActive("underline")}
            />
            <ToolbarButton
              label="Highlight"
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              isActive={editor?.isActive("highlight")}
            />
            <ToolbarButton
              label="• List"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              isActive={editor?.isActive("bulletList")}
            />
            <ToolbarButton
              label="H2"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor?.isActive("heading", { level: 2 })}
            />
            <ToolbarButton
              label="H3"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor?.isActive("heading", { level: 3 })}
            />
          </div>
          <div className="[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-6">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {errorMessage ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : "Save Note"}
      </button>
    </form>
  );
}

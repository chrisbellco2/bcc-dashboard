import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";

type AddNotePageProps = {
  params: Promise<{ id: string }>;
};

type StudentName = {
  id: string;
  full_name: string;
};

const NOTE_TYPES = ["Meeting", "Phone", "Email", "Text", "Zoom", "Internal"] as const;
const AUTHORS = ["Chris", "Gav"] as const;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AddNotePage({ params }: AddNotePageProps) {
  const { id } = await params;

  const { data: student, error } = await supabaseServer
    .from("students")
    .select("id, full_name")
    .eq("id", id)
    .single<StudentName>();

  if (error || !student) {
    notFound();
  }

  async function saveNote(formData: FormData) {
    "use server";

    const payload = {
      student_id: id,
      note_date: String(formData.get("note_date") ?? ""),
      note_type: String(formData.get("note_type") ?? ""),
      author: String(formData.get("author") ?? ""),
      raw_content: String(formData.get("raw_content") ?? ""),
    };

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/notes/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error ?? "Unable to save note.");
    }

    revalidatePath(`/students/${id}`);
    revalidatePath("/");
    redirect(`/students/${id}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 text-stone-800 md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/students/${id}`}
          className="inline-flex items-center text-sm font-medium text-stone-700 transition-colors hover:text-amber-900 hover:underline"
        >
          ← Back to Student
        </Link>

        <header className="rounded-2xl border border-stone-200 bg-[#faf7f2] p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{student.full_name}</h1>
          <p className="mt-2 text-sm text-stone-600">Add a new advising note.</p>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <form action={saveNote} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="note_date" className="mb-1 block text-sm font-medium text-stone-700">
                  Note Date
                </label>
                <input
                  id="note_date"
                  name="note_date"
                  type="date"
                  defaultValue={todayIsoDate()}
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
                  name="note_type"
                  required
                  defaultValue="Meeting"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800"
                >
                  {NOTE_TYPES.map((noteType) => (
                    <option key={noteType} value={noteType}>
                      {noteType}
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
                  name="author"
                  required
                  defaultValue="Chris"
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800"
                >
                  {AUTHORS.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="raw_content" className="mb-1 block text-sm font-medium text-stone-700">
                Note Content
              </label>
              <textarea
                id="raw_content"
                name="raw_content"
                rows={14}
                required
                className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm leading-6 text-stone-800"
                placeholder="Enter meeting notes, call summary, key action items, and next steps..."
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-800"
            >
              Save Note
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

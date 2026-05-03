import Link from "next/link";
import { notFound } from "next/navigation";

import NoteMarkdown from "@/app/components/note-markdown";
import { supabaseServer } from "@/lib/supabase/server";

type StudentDetail = {
  id: string;
  full_name: string;
  graduation_year: number;
  phase_key: string;
  current_mode: string;
  lead_advisor: string;
  student_key: string;
  status: string;
};

type NoteRow = {
  id: string;
  note_date: string;
  note_type: string;
  author: string;
  raw_content: string;
};

type StudentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;

  const [{ data: student, error: studentError }, { data: notes, error: notesError }] =
    await Promise.all([
      supabaseServer
        .from("students")
        .select(
          "id, full_name, graduation_year, phase_key, current_mode, lead_advisor, student_key, status"
        )
        .eq("id", id)
        .single<StudentDetail>(),
      supabaseServer
        .from("notes")
        .select("id, note_date, note_type, author, raw_content")
        .eq("student_id", id)
        .order("note_date", { ascending: false }),
    ]);

  if (studentError || !student) {
    notFound();
  }

  if (notesError) {
    return (
      <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 text-stone-800 md:px-10">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-stone-700 transition-colors hover:text-amber-900 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
            <h1 className="text-xl font-semibold">Unable to load notes</h1>
            <p className="mt-2 text-sm">
              Student details loaded, but notes could not be fetched from Supabase.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 text-stone-800 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-stone-700 transition-colors hover:text-amber-900 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <header className="rounded-2xl border border-stone-200 bg-[#faf7f2] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{student.full_name}</h1>
            <Link
              href={`/students/${id}/add-note`}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-800"
            >
              Add Note
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-stone-700 md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Graduation Year</dt>
              <dd className="mt-1 font-medium text-stone-900">{student.graduation_year}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Phase</dt>
              <dd className="mt-1 font-medium text-stone-900">{student.phase_key}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Mode</dt>
              <dd className="mt-1 font-medium text-stone-900">{student.current_mode}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Lead Advisor</dt>
              <dd className="mt-1 font-medium text-stone-900">{student.lead_advisor}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Student Key</dt>
              <dd className="mt-1 font-mono text-xs text-stone-900">{student.student_key}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-stone-500">Status</dt>
              <dd className="mt-1 font-medium text-stone-900">{student.status}</dd>
            </div>
          </dl>
        </header>

        <section className="rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <h2 className="text-xl font-semibold text-stone-900">Notes</h2>

          {notes && notes.length > 0 ? (
            <div className="mt-4 space-y-3">
              {notes.map((note: NoteRow) => (
                <article key={note.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-wide text-stone-500">
                    <span>{note.note_date}</span>
                    <span>{note.note_type}</span>
                    <span>{note.author}</span>
                  </div>
                  <div className="mt-3">
                    <NoteMarkdown content={note.raw_content} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              No notes yet
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

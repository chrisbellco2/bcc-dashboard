import Link from "next/link";
import { notFound } from "next/navigation";

import { supabaseServer } from "@/lib/supabase/server";
import AddNoteForm from "./add-note-form";

type AddNotePageProps = {
  params: Promise<{ id: string }>;
};

type StudentName = {
  id: string;
  full_name: string;
};

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
          <AddNoteForm studentId={id} />
        </section>
      </div>
    </main>
  );
}

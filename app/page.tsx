import { supabaseServer } from "@/lib/supabase/server";

type StudentRow = {
  id: string;
  full_name: string;
  graduation_year: number;
  phase_key: string;
  lead_advisor: string;
  student_key: string;
  status: string;
  needs_attention: boolean;
  created_at: string;
};

function dateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function StudentTable({ students }: { students: StudentRow[] }) {
  if (students.length === 0) {
    return (
      <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        No students match this section right now.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm text-stone-700">
        <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
          <tr>
            <th className="px-4 py-3 font-medium">Full Name</th>
            <th className="px-4 py-3 font-medium">Graduation Year</th>
            <th className="px-4 py-3 font-medium">Phase</th>
            <th className="px-4 py-3 font-medium">Lead Advisor</th>
            <th className="px-4 py-3 font-medium">Student Key</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-stone-50">
              <td className="px-4 py-3 font-medium text-stone-900">{student.full_name}</td>
              <td className="px-4 py-3">{student.graduation_year}</td>
              <td className="px-4 py-3">{student.phase_key}</td>
              <td className="px-4 py-3">{student.lead_advisor}</td>
              <td className="px-4 py-3 font-mono text-xs">{student.student_key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Home() {
  const newStudentCutoff = new Date();
  newStudentCutoff.setDate(newStudentCutoff.getDate() - 7);

  const noteCutoff14 = dateDaysAgo(14);
  const noteCutoff21 = dateDaysAgo(21);

  const [newStudentsRes, activeStudentsRes, recent14Res, recent21Res] = await Promise.all([
    supabaseServer
      .from("students")
      .select(
        "id, full_name, graduation_year, phase_key, lead_advisor, student_key, status, needs_attention, created_at"
      )
      .gt("created_at", newStudentCutoff.toISOString())
      .order("created_at", { ascending: false }),
    supabaseServer
      .from("students")
      .select(
        "id, full_name, graduation_year, phase_key, lead_advisor, student_key, status, needs_attention, created_at"
      )
      .eq("status", "Active")
      .order("full_name", { ascending: true }),
    supabaseServer.from("notes").select("student_id").gt("note_date", noteCutoff14),
    supabaseServer.from("notes").select("student_id").gt("note_date", noteCutoff21),
  ]);

  if (newStudentsRes.error || activeStudentsRes.error || recent14Res.error || recent21Res.error) {
    return (
      <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 md:px-10">
        <div className="mx-auto max-w-5xl rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <h1 className="text-xl font-semibold">BCC Dashboard</h1>
          <p className="mt-2 text-sm">
            Unable to load one or more sections from Supabase. Check your local environment
            variables and table policies.
          </p>
        </div>
      </main>
    );
  }

  const newStudents = (newStudentsRes.data ?? []) as StudentRow[];
  const activeStudents = (activeStudentsRes.data ?? []) as StudentRow[];
  const recent14StudentIds = new Set((recent14Res.data ?? []).map((row) => row.student_id));
  const recent21StudentIds = new Set((recent21Res.data ?? []).map((row) => row.student_id));

  // Ball Check: status = Active AND no note in the last 14 days.
  const ballCheckStudents = activeStudents.filter((student) => !recent14StudentIds.has(student.id));

  // Needs Attention: status = Active AND (needs_attention = true OR no note in 21 days).
  const needsAttentionStudents = activeStudents.filter(
    (student) => student.needs_attention || !recent21StudentIds.has(student.id)
  );

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 text-stone-800 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-stone-200 bg-[#faf7f2] p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">BCC Dashboard</h1>
          <p className="mt-2 text-sm text-stone-600">
            Weekly Review for college advising. Snapshot of new students, intervention flags, and
            check-in cadence.
          </p>
        </header>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">New Students</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
              Last 7 days: {newStudents.length}
            </span>
          </div>
          <StudentTable students={newStudents} />
        </section>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">Needs Attention</h2>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900">
              Active interventions: {needsAttentionStudents.length}
            </span>
          </div>
          <StudentTable students={needsAttentionStudents} />
        </section>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">Ball Check</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
              No note in 14 days: {ballCheckStudents.length}
            </span>
          </div>
          <StudentTable students={ballCheckStudents} />
        </section>
      </div>
    </main>
  );
}

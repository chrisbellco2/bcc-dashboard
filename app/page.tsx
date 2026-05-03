import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import AllStudentsTable from "@/app/components/all-students-table";
import LogoutButton from "@/app/components/logout-button";

type StudentRow = {
  id: string;
  first_name: string;
  full_name: string;
  last_name: string;
  graduation_year: number;
  phase_key: string;
  lead_advisor: string;
  student_key: string;
  ball_owner: string | null;
  status: string;
  needs_attention: boolean;
  created_at: string;
  imported_on: string | null;
  last_cpp_activity: string | null;
  current_status: string | null;
};

function dateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function hasRecentCppActivity(lastCppActivity: string | null, cutoffDate: string): boolean {
  if (!lastCppActivity) {
    return false;
  }

  const activityDate = new Date(lastCppActivity);
  const cutoff = new Date(cutoffDate);

  if (Number.isNaN(activityDate.getTime()) || Number.isNaN(cutoff.getTime())) {
    return false;
  }

  return activityDate >= cutoff;
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
              <td className="px-4 py-3 font-medium text-stone-900">
                <Link
                  href={`/students/${student.id}`}
                  className="transition-colors hover:text-amber-900 hover:underline"
                >
                  {student.full_name}
                </Link>
              </td>
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
  const newStudentCutoff = dateDaysAgo(7);
  const noteCutoff21 = dateDaysAgo(21);

  const [newStudentsRes, activeStudentsRes, recent21Res] = await Promise.all([
    supabaseServer
      .from("students")
      .select(
        "id, first_name, full_name, last_name, graduation_year, phase_key, lead_advisor, student_key, ball_owner, status, needs_attention, created_at, imported_on, last_cpp_activity, current_status"
      )
      .gte("imported_on", newStudentCutoff)
      .order("imported_on", { ascending: false }),
    supabaseServer
      .from("students")
      .select(
        "id, first_name, full_name, last_name, graduation_year, phase_key, lead_advisor, student_key, ball_owner, status, needs_attention, created_at, imported_on, last_cpp_activity, current_status"
      )
      .eq("status", "Active")
      .order("first_name", { ascending: true }),
    supabaseServer.from("notes").select("student_id").gt("note_date", noteCutoff21),
  ]);

  if (newStudentsRes.error || activeStudentsRes.error || recent21Res.error) {
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
  const recent21StudentIds = new Set((recent21Res.data ?? []).map((row) => row.student_id));

  // Needs Attention: status = Active AND (needs_attention = true OR no note/CPP activity in 21 days).
  const needsAttentionStudents = activeStudents.filter(
    (student) =>
      student.needs_attention ||
      (!recent21StudentIds.has(student.id) &&
        !hasRecentCppActivity(student.last_cpp_activity, noteCutoff21))
  );
  const ballWithBccStudents = activeStudents.filter(
    (student) => student.ball_owner === "Chris" || student.ball_owner === "Gav"
  );
  const ballWithStudentStudents = activeStudents.filter((student) => student.ball_owner === "Student");

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 text-stone-800 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-stone-200 bg-[#faf7f2] p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">BCC Dashboard</h1>
              <p className="mt-2 text-sm text-stone-600">
                Weekly Review for college advising. Snapshot of new students, intervention flags,
                and check-in cadence.
              </p>
            </div>
            <LogoutButton />
          </div>
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
            <h2 className="text-xl font-semibold text-stone-900">Ball is with BCC</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
              Active: {ballWithBccStudents.length}
            </span>
          </div>
          <StudentTable students={ballWithBccStudents} />
        </section>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">Ball is with Student</h2>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-900">
              Active: {ballWithStudentStudents.length}
            </span>
          </div>
          <StudentTable students={ballWithStudentStudents} />
        </section>

        <section className="space-y-3 rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">All Students</h2>
            <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-medium text-stone-800">
              Active total: {activeStudents.length}
            </span>
          </div>
          <AllStudentsTable
            students={activeStudents}
            recent21StudentIds={Array.from(recent21StudentIds)}
            noteCutoff21={noteCutoff21}
            newStudentCutoff={newStudentCutoff}
          />
        </section>
      </div>
    </main>
  );
}

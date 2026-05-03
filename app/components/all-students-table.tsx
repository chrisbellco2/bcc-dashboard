"use client";

import Link from "next/link";
import { KeyboardEvent, useMemo, useState } from "react";

type StudentRow = {
  id: string;
  full_name: string;
  graduation_year: number;
  phase_key: string;
  ball_owner: string | null;
  needs_attention: boolean;
  imported_on: string | null;
  last_cpp_activity: string | null;
  current_status: string | null;
};

type Props = {
  students: StudentRow[];
  recent21StudentIds: string[];
  noteCutoff21: string;
  newStudentCutoff: string;
};

const BALL_OWNER_OPTIONS = ["Student", "Chris", "Gav", "Mark", "Laura", "Esther"] as const;

function hasRecentDate(value: string | null, cutoffDate: string): boolean {
  if (!value) {
    return false;
  }

  const activityDate = new Date(value);
  const cutoff = new Date(cutoffDate);

  if (Number.isNaN(activityDate.getTime()) || Number.isNaN(cutoff.getTime())) {
    return false;
  }

  return activityDate >= cutoff;
}

export default function AllStudentsTable({
  students,
  recent21StudentIds,
  noteCutoff21,
  newStudentCutoff,
}: Props) {
  const [rows, setRows] = useState<StudentRow[]>(students);
  const [editingBallOwnerId, setEditingBallOwnerId] = useState<string | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<string>("");
  const [savingFieldKey, setSavingFieldKey] = useState<string | null>(null);

  const recentNoteIdSet = useMemo(() => new Set(recent21StudentIds), [recent21StudentIds]);

  async function saveField(studentId: string, field: "ball_owner" | "current_status", value: string) {
    const key = `${studentId}:${field}`;
    setSavingFieldKey(key);

    const response = await fetch("/api/students/update-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: studentId,
        field,
        value,
      }),
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      setSavingFieldKey(null);
      throw new Error(result?.error ?? "Unable to save changes.");
    }

    setRows((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [field]: field === "current_status" && value.trim().length === 0 ? null : value,
            }
          : student
      )
    );

    setSavingFieldKey(null);
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
        No active students found.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm text-stone-700">
        <thead className="bg-stone-100 text-xs uppercase tracking-wide text-stone-600">
          <tr>
            <th className="px-4 py-3 font-medium">!</th>
            <th className="px-4 py-3 font-medium">New</th>
            <th className="px-4 py-3 font-medium">Ball</th>
            <th className="px-4 py-3 font-medium">Current Status</th>
            <th className="px-4 py-3 font-medium">Full Name</th>
            <th className="px-4 py-3 font-medium">Graduation Year</th>
            <th className="px-4 py-3 font-medium">Phase</th>
            <th className="px-4 py-3 font-medium">Ball Owner</th>
            <th className="px-4 py-3 font-medium">Last CPP Activity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((student) => {
            const noContactIn21Days =
              !recentNoteIdSet.has(student.id) && !hasRecentDate(student.last_cpp_activity, noteCutoff21);
            const needsAttentionIcon = student.needs_attention || noContactIn21Days ? "⚠️" : "";
            const newIcon = student.imported_on && hasRecentDate(student.imported_on, newStudentCutoff) ? "🟢" : "";
            const ballIcon = student.ball_owner === "Chris" || student.ball_owner === "Gav" ? "🔵" : "⚪";
            const isSavingBallOwner = savingFieldKey === `${student.id}:ball_owner`;
            const isSavingStatus = savingFieldKey === `${student.id}:current_status`;

            return (
              <tr key={student.id} className="hover:bg-stone-50">
                <td className="px-4 py-3 text-base">{needsAttentionIcon}</td>
                <td className="px-4 py-3 text-base">{newIcon}</td>
                <td className="px-4 py-3 text-base">{ballIcon}</td>
                <td className="px-4 py-3">
                  {editingStatusId === student.id ? (
                    <input
                      autoFocus
                      value={statusDraft}
                      onChange={(event) => setStatusDraft(event.target.value)}
                      onBlur={async () => {
                        try {
                          await saveField(student.id, "current_status", statusDraft);
                        } catch {
                          // Keep UI clean for now, without inline error noise.
                        }
                        setEditingStatusId(null);
                      }}
                      onKeyDown={async (event: KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          try {
                            await saveField(student.id, "current_status", statusDraft);
                          } catch {
                            // Keep UI clean for now, without inline error noise.
                          }
                          setEditingStatusId(null);
                        }
                      }}
                      disabled={isSavingStatus}
                      className="w-44 rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-stone-800"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusDraft(student.current_status ?? "");
                        setEditingStatusId(student.id);
                      }}
                      className="min-h-8 min-w-28 rounded-md border border-transparent px-2 py-1 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      {student.current_status || "—"}
                    </button>
                  )}
                </td>
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
                <td className="px-4 py-3">
                  {editingBallOwnerId === student.id ? (
                    <select
                      autoFocus
                      value={student.ball_owner ?? "Student"}
                      onBlur={() => setEditingBallOwnerId(null)}
                      onChange={async (event) => {
                        const nextOwner = event.target.value;
                        try {
                          await saveField(student.id, "ball_owner", nextOwner);
                        } catch {
                          // Keep UI clean for now, without inline error noise.
                        }
                        setEditingBallOwnerId(null);
                      }}
                      disabled={isSavingBallOwner}
                      className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-stone-800"
                    >
                      {BALL_OWNER_OPTIONS.map((owner) => (
                        <option key={owner} value={owner}>
                          {owner}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingBallOwnerId(student.id)}
                      className="rounded-md border border-transparent px-2 py-1 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      {student.ball_owner ?? "—"}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">{student.last_cpp_activity ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

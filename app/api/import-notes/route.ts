import JSZip from "jszip";

import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

type StudentRow = {
  id: string;
  first_name: string;
  last_name: string;
};

const MONTH_IN_NAME =
  /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*,?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i;

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Basename only — must match `source_filename` stored on insert (no folder path). */
function basenameFromZipPath(zipPath: string): string {
  const normalized = zipPath.replace(/\\/g, "/").replace(/^\.\/+/, "");
  const segments = normalized.split("/").filter((s) => s.length > 0);
  return segments[segments.length - 1] ?? "";
}

/** Expects …/Student Name/filename.md — student folder is parent of file. */
function studentFolderFromZipPath(zipPath: string): string | null {
  const normalized = zipPath.replace(/\\/g, "/").replace(/^\.\/+/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 3) return null;
  return parts[parts.length - 2] ?? null;
}

function noteDateFromFilename(basename: string, zipEntryDate?: Date): string {
  const base = basename.replace(/\.md$/i, "").replace(/[_-]+/g, " ").trim();

  const d1 = new Date(base);
  if (!Number.isNaN(d1.getTime())) return d1.toISOString().slice(0, 10);

  const m = base.match(MONTH_IN_NAME)?.[0];
  if (m) {
    const d2 = new Date(m);
    if (!Number.isNaN(d2.getTime())) return d2.toISOString().slice(0, 10);
  }

  if (zipEntryDate && !Number.isNaN(zipEntryDate.getTime())) {
    return zipEntryDate.toISOString().slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function isLikelyZip(file: File): boolean {
  const name = file.name.toLowerCase();
  const t = file.type;
  return (
    name.endsWith(".zip") ||
    t === "application/zip" ||
    t === "application/x-zip-compressed" ||
    t === "application/octet-stream" ||
    t === ""
  );
}

export async function POST(request: Request) {
  let created = 0;
  let skipped = 0;
  let unmatched = 0;
  /** Failed `notes` inserts only (Supabase/Postgres error on insert). */
  let errors = 0;
  /** Path shape, duplicate lookup, or zip read issues — not counted in `errors`. */
  let preflight_errors = 0;
  const unmatchedNames = new Set<string>();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { ok: false as const, error: "Invalid multipart body. Use FormData with a field named file." },
      { status: 400 }
    );
  }

  const uploaded = formData.get("file");
  if (!(uploaded instanceof File)) {
    return Response.json({ ok: false as const, error: "Missing file field." }, { status: 400 });
  }

  if (!isLikelyZip(uploaded)) {
    return Response.json({ ok: false as const, error: "Upload a .zip archive." }, { status: 400 });
  }

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await uploaded.arrayBuffer());
  } catch {
    return Response.json({ ok: false as const, error: "Could not read zip archive." }, { status: 400 });
  }

  const { data: students, error: studentsError } = await supabaseServer
    .from("students")
    .select("id, first_name, last_name");

  if (studentsError) {
    return Response.json({ ok: false as const, error: studentsError.message }, { status: 500 });
  }

  const byFullName = new Map<string, StudentRow>();
  for (const s of (students ?? []) as StudentRow[]) {
    const key = normalizeName(`${s.first_name} ${s.last_name}`);
    if (!byFullName.has(key)) byFullName.set(key, s);
  }

  const mdEntries = Object.values(zip.files).filter(
    (z) => !z.dir && z.name.toLowerCase().endsWith(".md")
  );

  for (const entry of mdEntries) {
    const sourceFilename = basenameFromZipPath(entry.name);
    const folder = studentFolderFromZipPath(entry.name);

    const pathSegments = entry.name.replace(/\\/g, "/").split("/").filter(Boolean);
    if (pathSegments.some((segment) => segment === "__MACOSX")) {
      continue;
    }
    if (sourceFilename.startsWith("._")) {
      continue;
    }

    if (!folder || !sourceFilename) {
      preflight_errors += 1;
      continue;
    }

    const student = byFullName.get(normalizeName(folder));
    if (!student) {
      unmatched += 1;
      unmatchedNames.add(folder);
      continue;
    }

    const { count: existingCount, error: dupLookupError } = await supabaseServer
      .from("notes")
      .select("id", { count: "exact", head: true })
      .eq("student_id", student.id)
      .eq("source_filename", sourceFilename);

    if (dupLookupError) {
      preflight_errors += 1;
      continue;
    }

    if (existingCount != null && existingCount > 0) {
      skipped += 1;
    } else {
      let raw: string;
      try {
        raw = await entry.async("string");
      } catch {
        preflight_errors += 1;
        continue;
      }

      const note_date = noteDateFromFilename(sourceFilename, entry.date);

      const insertResult = await supabaseServer.from("notes").insert({
        student_id: student.id,
        author: "Chris",
        note_type: "Meeting",
        note_date,
        raw_content: raw,
        extraction_status: "Pending",
        source_filename: sourceFilename,
      });

      if (insertResult.error) {
        const err = insertResult.error;
        const msg = (err.message ?? "").toLowerCase();
        const isUniqueViolation =
          err.code === "23505" || msg.includes("duplicate key") || msg.includes("unique constraint");

        if (isUniqueViolation) {
          skipped += 1;
        } else {
          errors += 1;
        }
        continue;
      }

      created += 1;
    }
  }

  return Response.json({
    ok: true as const,
    created,
    skipped,
    unmatched,
    errors,
    preflight_errors,
    unmatchedNames: Array.from(unmatchedNames).sort(),
  });
}

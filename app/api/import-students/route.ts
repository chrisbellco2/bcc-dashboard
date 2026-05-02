import { supabaseServer } from "@/lib/supabase/server";

const REQUIRED_HEADERS = [
  "First name",
  "Last name",
  "Email",
  "HS grad year",
  "High School",
  "Client status",
  "Date added",
  "Last note",
  "Most recent login",
  "Primary consultant",
] as const;

type CsvRow = Record<(typeof REQUIRED_HEADERS)[number], string>;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const headerIndex = new Map<string, number>();
  headers.forEach((header, index) => {
    headerIndex.set(header, index);
  });

  const missing = REQUIRED_HEADERS.filter((header) => !headerIndex.has(header));
  if (missing.length > 0) {
    throw new Error(`Missing required CSV columns: ${missing.join(", ")}`);
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {} as CsvRow;

    for (const header of REQUIRED_HEADERS) {
      const index = headerIndex.get(header);
      row[header] = index === undefined ? "" : (values[index] ?? "").trim();
    }

    return row;
  });
}

function parseDateValue(value: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function parseTimestampValue(value: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function mapLeadAdvisor(value: string): string {
  return value === "Chris Bell" ? "Chris" : value || "Chris";
}

export async function POST(request: Request) {
  let created = 0;
  let updated = 0;
  let errors = 0;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "No CSV file uploaded." }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return Response.json({ created, updated, errors });
    }

    const rowsWithEmail = rows.filter((row) => row["Email"]);
    errors += rows.length - rowsWithEmail.length;

    const emails = Array.from(new Set(rowsWithEmail.map((row) => row["Email"].toLowerCase())));

    const { data: existingStudents, error: existingError } = await supabaseServer
      .from("students")
      .select("email")
      .in("email", emails);

    if (existingError) {
      return Response.json({ error: existingError.message }, { status: 500 });
    }

    const existingEmails = new Set(
      (existingStudents ?? [])
        .map((student) => student.email)
        .filter((email): email is string => Boolean(email))
        .map((email) => email.toLowerCase())
    );

    const toInsert = rowsWithEmail
      .filter((row) => !existingEmails.has(row["Email"].toLowerCase()))
      .map((row) => ({
        first_name: row["First name"] || "Unknown",
        last_name: row["Last name"] || "Unknown",
        email: row["Email"].toLowerCase(),
        graduation_year: Number.parseInt(row["HS grad year"], 10) || new Date().getFullYear(),
        high_school_name: row["High School"] || null,
        status: row["Client status"] || "Active",
        imported_on: parseTimestampValue(row["Date added"]),
        last_cpp_activity: parseDateValue(row["Last note"]),
        last_cpp_login: row["Most recent login"] || null,
        lead_advisor: mapLeadAdvisor(row["Primary consultant"]),
        phase_key: "YOU",
        current_mode: "Exploratory",
        ball_owner: "Student",
      }));

    if (toInsert.length > 0) {
      const { error: insertError, count } = await supabaseServer
        .from("students")
        .insert(toInsert, { count: "exact" });

      if (insertError) {
        errors += toInsert.length;
      } else {
        created += count ?? toInsert.length;
      }
    }

    const toUpdate = rowsWithEmail.filter((row) => existingEmails.has(row["Email"].toLowerCase()));

    for (const row of toUpdate) {
      const { error: updateError } = await supabaseServer
        .from("students")
        .update({
          last_cpp_activity: parseDateValue(row["Last note"]),
          last_cpp_login: row["Most recent login"] || null,
        })
        .eq("email", row["Email"].toLowerCase());

      if (updateError) {
        errors += 1;
      } else {
        updated += 1;
      }
    }

    return Response.json({ created, updated, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    return Response.json({ created, updated, errors: errors + 1, error: message }, { status: 400 });
  }
}

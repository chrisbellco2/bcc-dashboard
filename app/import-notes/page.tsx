"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

const IMPORT_NOTES_API = "/api/import-notes";

type ImportNotesResponse = {
  ok: true;
  created: number;
  skipped: number;
  unmatched: number;
  errors: number;
  preflight_errors: number;
  unmatchedNames: string[];
};

export default function ImportNotesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportNotesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runImport = useCallback(async () => {
    if (!file) {
      setError("Choose a .zip file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch(IMPORT_NOTES_API, {
        method: "POST",
        body,
      });

      const data = (await res.json()) as
        | ImportNotesResponse
        | { ok?: false; error?: string };

      if (!res.ok || !("ok" in data) || data.ok !== true) {
        const message =
          typeof data === "object" && data && "error" in data && typeof data.error === "string"
            ? data.error
            : "Import failed.";
        setError(message);
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [file]);

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-6 py-10 text-stone-800 md:px-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-stone-700 transition-colors hover:text-amber-900 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <section className="rounded-2xl border border-stone-200 bg-[#faf7f2] p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Import Apple Notes</h1>
          <p className="mt-2 text-sm text-stone-600">
            Upload a zip export from Apple Notes. Files are processed on the server and matched to
            students by folder name.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="zip" className="mb-2 block text-sm font-medium text-stone-700">
                Zip archive
              </label>
              <input
                id="zip"
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed,application/octet-stream"
                disabled={loading}
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setResult(null);
                  setError(null);
                }}
                className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 file:mr-4 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-300 disabled:opacity-60"
              />
            </div>

            <button
              type="button"
              disabled={loading || !file}
              onClick={runImport}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Importing…" : "Import notes"}
            </button>
          </div>
        </section>

        {result ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <h2 className="text-lg font-semibold">Results</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>Created: {result.created}</li>
              <li>Skipped (duplicates): {result.skipped}</li>
              <li>Unmatched students: {result.unmatched}</li>
              <li>Insert failures: {result.errors}</li>
              <li>Preflight issues (path / lookup / read): {result.preflight_errors}</li>
            </ul>
            {result.unmatchedNames.length > 0 ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <p className="text-sm font-semibold">Unmatched names</p>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {result.unmatchedNames.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <h2 className="text-lg font-semibold">Error</h2>
            <p className="mt-2 text-sm">{error}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

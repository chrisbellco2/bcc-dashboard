"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ImportResult = {
  created: number;
  updated: number;
  errors: number;
};

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setErrorMessage("Please choose a CSV file first.");
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import-students", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Import failed.");
      }

      setResult({
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        errors: data.errors ?? 0,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Import failed.");
    } finally {
      setIsImporting(false);
    }
  }

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
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Import Students</h1>
          <p className="mt-2 text-sm text-stone-600">
            Upload a College Planner Pro export to create new students and refresh CPP activity
            fields.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-[#fcfaf6] p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="csv-file" className="mb-2 block text-sm font-medium text-stone-700">
                CPP CSV File
              </label>
              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv,.zip,application/zip,application/x-zip-compressed"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 file:mr-4 file:rounded-md file:border-0 file:bg-stone-200 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={isImporting}
              className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-amber-50 transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isImporting ? "Importing..." : "Import"}
            </button>
          </form>
        </section>

        {result ? (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <h2 className="text-lg font-semibold">Import Results</h2>
            <p className="mt-2 text-sm">Created: {result.created}</p>
            <p className="text-sm">Updated: {result.updated}</p>
            <p className="text-sm">Errors: {result.errors}</p>
          </section>
        ) : null}

        {errorMessage ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
            <h2 className="text-lg font-semibold">Import Error</h2>
            <p className="mt-2 text-sm">{errorMessage}</p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

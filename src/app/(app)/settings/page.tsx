"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSavedApiKey, saveApiKey } from "@/lib/byok";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setApiKey(getSavedApiKey());
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-6 p-4 md:p-8">
      <h1 className="text-xl font-bold">Pengaturan Kupas</h1>

      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-semibold">Mode Gratis Tanpa Batas (BYOK)</h2>
        <p className="mt-1 text-sm text-muted">
          Tempel API Key gratis dari{" "}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-accent underline">
            Google AI Studio
          </a>{" "}
          agar kamu bisa belajar tanpa batas harian. Kunci ini hanya disimpan di perangkatmu sendiri.
        </p>
        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="h-10 flex-1 rounded-md border border-border-input bg-surface px-3 text-sm"
          />
          <Button type="submit">Simpan Kunci</Button>
        </form>
        {saved && <p role="status" className="mt-2 text-xs text-success-text">API Key berhasil disimpan di perangkat.</p>}
      </section>
    </div>
  );
}

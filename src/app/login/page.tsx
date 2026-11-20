"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 6) {
      setError("Masukkan email yang valid dan kata sandi minimal 6 karakter.");
      return;
    }
    setLoading(true);
    setTimeout(() => router.push("/dashboard"), 250);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-xl font-bold text-text">Masuk ke ruang belajarmu</h1>
        <p className="mt-1 text-sm text-muted">Gratis tanpa langganan dan tanpa kartu kredit.</p>

        {error && (
          <div role="alert" className="mt-4 rounded-md bg-danger-bg p-3 text-sm text-danger-text">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border-input bg-surface px-3 text-sm"
              placeholder="kamu@kampus.ac.id"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text">Kata Sandi</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border-input bg-surface px-3 text-sm"
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">Masuk</Button>
        </form>
      </div>
    </div>
  );
}

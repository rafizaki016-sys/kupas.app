"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Settings, Sparkles } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Materi", icon: BookOpen },
  { href: "/snap", label: "Foto Soal", icon: Camera },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 bg-accent text-on-accent px-3 py-2 rounded-md"
      >
        Langsung ke konten
      </a>

      <aside className="hidden md:flex md:w-[260px] md:flex-col border-r border-border bg-surface p-4 justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 px-2 py-3 font-bold text-lg text-accent">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span>Kupas</span>
          </Link>
          <nav aria-label="Utama" className="mt-4 flex flex-col gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? "bg-surface-subtle text-text font-semibold"
                      : "text-muted hover:bg-surface-subtle hover:text-text"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-md border border-border bg-surface-subtle p-3 text-xs">
          <p className="font-semibold text-text">100% Gratis Tanpa Paywall</p>
          <p className="text-muted mt-1">
            Tempel API Key gratis Google AI Studio di Pengaturan untuk belajar tanpa batas harian.
          </p>
          <Link href="/settings" className="mt-2 inline-block font-semibold text-accent underline underline-offset-2">
            Atur Mode BYOK
          </Link>
        </div>
      </aside>

      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      <nav
        aria-label="Utama seluler"
        className="md:hidden fixed bottom-0 inset-x-0 h-14 bg-surface border-t border-border flex items-center justify-around z-40"
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 text-xs ${
                active ? "text-accent font-semibold" : "text-muted"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

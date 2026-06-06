"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, HardDrive, Search, Star, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Dialog, DialogContent } from "~/components/ui/dialog";
import { type DriveFileMeta, type DriveKind } from "~/lib/google/fake-drive";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const ROBOTO = { fontFamily: "var(--font-roboto), Roboto, Arial, sans-serif" } as const;
const GBLUE = "#1a73e8";
const ACCOUNT = { name: "Sergey Troinin", email: "sergey4troinin@gmail.com" };
const CONNECT_KEY = "fake-gdrive-connected";

/* ---- brand marks --------------------------------------------------------- */

export function GoogleG({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z" />
      <path fill="#FBBC05" d="M10.5 28.3a14.5 14.5 0 0 1 0-8.6l-7.9-6.1a24 24 0 0 0 0 20.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.7 2.3-6.3 0-11.6-3.7-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function DriveLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87 78" aria-hidden>
      <path fill="#0066da" d="M6.6 66.85 10.45 73.5c.8 1.4 1.95 2.5 3.3 3.3L27.5 53.5H0c0 1.55.4 3.1 1.2 4.5z" />
      <path fill="#00ac47" d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" />
      <path fill="#ea4335" d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.5l5.85 11.5z" />
      <path fill="#00832d" d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" />
      <path fill="#2684fc" d="M59.5 53.5h-32L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.4c1.6 0 3.15-.45 4.5-1.2z" />
      <path fill="#ffba00" d="M73.4 26.5 60.75 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.5 53.5h27.45c0-1.55-.4-3.1-1.2-4.5z" />
    </svg>
  );
}

/** Drive file-type icon. */
function FileIcon({ kind }: { kind: DriveKind }) {
  const palette: Record<DriveKind, string> = {
    doc: "#4285F4",
    sheet: "#34A853",
    slides: "#F4B400",
    pdf: "#EA4335",
    image: "#A142F4",
  };
  const c = palette[kind];
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden>
      <path
        d="M10 4h13l7 7v22a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"
        fill={c}
        opacity={0.12}
      />
      <path d="M23 4l7 7h-7V4z" fill={c} opacity={0.35} />
      <path
        d="M10 4h13l7 7v22a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z"
        fill="none"
        stroke={c}
        strokeWidth={1.6}
      />
      {kind === "sheet" ? (
        <g stroke={c} strokeWidth={1.4}>
          <path d="M12 20h16M12 25h16M18 16v14M24 16v14" />
        </g>
      ) : kind === "slides" ? (
        <rect x={12} y={18} width={16} height={10} rx={1.5} fill="none" stroke={c} strokeWidth={1.6} />
      ) : kind === "image" ? (
        <g fill={c}>
          <circle cx={15} cy={19} r={2} />
          <path d="M12 30l5-6 4 4 3-3 4 5z" />
        </g>
      ) : kind === "pdf" ? (
        <text x={20} y={28} textAnchor="middle" fontSize={7} fontWeight={700} fill={c} style={ROBOTO}>
          PDF
        </text>
      ) : (
        <g stroke={c} strokeWidth={1.4}>
          <path d="M12 18h16M12 22h16M12 26h11" />
        </g>
      )}
    </svg>
  );
}

/* ---- picker -------------------------------------------------------------- */

type Tab = "recent" | "mydrive" | "starred" | "shared";
const TABS: { key: Tab; label: string; icon: typeof Clock }[] = [
  { key: "recent", label: "Recent", icon: Clock },
  { key: "mydrive", label: "My Drive", icon: HardDrive },
  { key: "starred", label: "Starred", icon: Star },
  { key: "shared", label: "Shared with me", icon: Users },
];

function relTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function sizeLabel(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1_048_576) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1_048_576).toFixed(1)} MB`;
}

export function GoogleDrivePicker({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirm: (files: DriveFileMeta[]) => void;
}) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [tab, setTab] = useState<Tab>("recent");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const files = api.drive.list.useQuery(undefined, { enabled: open });

  useEffect(() => {
    if (open) {
      setConnected(localStorage.getItem(CONNECT_KEY) === "1");
      setSelected(new Set());
      setQuery("");
      setTab("recent");
    }
  }, [open]);

  function connect() {
    setConnecting(true);
    setTimeout(() => {
      localStorage.setItem(CONNECT_KEY, "1");
      setConnected(true);
      setConnecting(false);
    }, 900);
  }

  const list = useMemo(() => {
    let f = files.data ?? [];
    if (tab === "starred") f = f.filter((x) => x.starred);
    if (tab === "shared") f = f.filter((x) => x.shared);
    if (tab === "recent")
      f = [...f].sort((a, b) => +new Date(b.modified) - +new Date(a.modified));
    if (query.trim())
      f = f.filter((x) => x.name.toLowerCase().includes(query.toLowerCase()));
    return f;
  }, [files.data, tab, query]);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function confirm() {
    const picked = (files.data ?? []).filter((f) => selected.has(f.id));
    onConfirm(picked);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[86vh] gap-0 overflow-hidden rounded-xl p-0 sm:max-w-3xl"
        style={ROBOTO}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <DriveLogo />
            <span className="text-[15px] font-medium text-[#202124] dark:text-zinc-100">
              {connected ? "Select files" : "Google Drive"}
            </span>
          </div>
          {connected && (
            <div className="flex items-center gap-2 rounded-full border px-2 py-1">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
                style={{ background: "#7e57c2" }}
              >
                {ACCOUNT.name[0]}
              </div>
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {ACCOUNT.email}
              </span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!connected ? (
            /* --- Fake consent / connect screen --- */
            <motion.div
              key="connect"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center px-8 py-14 text-center"
            >
              <DriveLogo size={48} />
              <h2 className="mt-5 text-xl font-medium text-[#202124] dark:text-zinc-100">
                Connect Google Drive
              </h2>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                Import documents straight from your Drive into this project. Maverx
                will only read the files you choose.
              </p>
              <button
                onClick={connect}
                disabled={connecting}
                className="mt-7 flex items-center gap-3 rounded-md border border-[#dadce0] bg-white px-4 py-2.5 text-sm font-medium text-[#3c4043] shadow-sm transition hover:bg-[#f8faff] hover:shadow disabled:opacity-70"
              >
                {connecting ? (
                  <motion.span
                    className="h-[18px] w-[18px] rounded-full border-2 border-[#1a73e8] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                  />
                ) : (
                  <GoogleG />
                )}
                {connecting ? "Connecting…" : "Sign in with Google"}
              </button>
              <p className="text-muted-foreground/70 mt-6 text-[11px]">
                Demo integration — no real Google account is accessed.
              </p>
            </motion.div>
          ) : (
            /* --- Picker --- */
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-0 flex-col"
            >
              {/* Search */}
              <div className="px-5 pt-4">
                <div className="flex items-center gap-2 rounded-lg bg-[#f1f3f4] px-3.5 py-2.5 dark:bg-zinc-800">
                  <Search className="h-4 w-4 text-[#5f6368] dark:text-zinc-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search in Drive"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[#5f6368]"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 px-4 pt-3">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  const activeTab = tab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTab(t.key)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition",
                        activeTab
                          ? "bg-[#e8f0fe] text-[#1967d2] dark:bg-blue-500/15 dark:text-blue-300"
                          : "text-[#5f6368] hover:bg-[#f1f3f4] dark:text-zinc-400 dark:hover:bg-zinc-800",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* File grid */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                {files.isLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-muted h-28 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : list.length === 0 ? (
                  <p className="text-muted-foreground py-12 text-center text-sm">
                    No files match.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {list.map((f, i) => {
                      const isSel = selected.has(f.id);
                      return (
                        <motion.button
                          key={f.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.03, 0.25) }}
                          onClick={() => toggle(f.id)}
                          onDoubleClick={() => {
                            toggle(f.id);
                            setTimeout(confirm, 0);
                          }}
                          className={cn(
                            "group relative flex flex-col items-start rounded-lg border bg-white p-3 text-left transition dark:bg-zinc-900",
                            isSel
                              ? "border-[#1a73e8] ring-1 ring-[#1a73e8]"
                              : "border-[#e0e0e0] hover:border-[#d2e3fc] hover:bg-[#f8faff] dark:border-zinc-700 dark:hover:bg-zinc-800",
                          )}
                        >
                          <span
                            className={cn(
                              "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition",
                              isSel
                                ? "border-[#1a73e8] bg-[#1a73e8] text-white"
                                : "border-transparent text-transparent group-hover:border-[#dadce0]",
                            )}
                          >
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <FileIcon kind={f.kind} />
                          <span className="mt-2 line-clamp-2 text-[13px] font-medium text-[#202124] dark:text-zinc-100">
                            {f.name}
                          </span>
                          <span className="text-muted-foreground mt-1 text-[11px]">
                            {f.owner === "you" ? "me" : f.owner} · {relTime(f.modified)} ·{" "}
                            {sizeLabel(f.sizeBytes)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t px-5 py-3">
                <span className="text-muted-foreground text-xs">
                  {selected.size > 0
                    ? `${selected.size} selected`
                    : "Select files to import"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenChange(false)}
                    className="rounded-md px-4 py-2 text-sm font-medium text-[#1a73e8] transition hover:bg-[#f1f3f4] dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirm}
                    disabled={selected.size === 0}
                    className="rounded-md px-5 py-2 text-sm font-medium text-white shadow-sm transition disabled:opacity-40"
                    style={{ background: GBLUE }}
                  >
                    Select
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

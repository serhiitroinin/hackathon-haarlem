"use client";

import { Loader2, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { toast } from "sonner";

import { NotesChart } from "~/components/charts/notes-chart";
import { Chat } from "~/components/chat/chat";
import { Editor } from "~/components/editor/editor";
import { type MapPoint } from "~/components/map/map";

// MapLibre touches `window` at import time — load it client-only.
const Map = dynamic(() => import("~/components/map/map").then((m) => m.Map), {
  ssr: false,
  loading: () => (
    <div className="bg-muted h-[28rem] animate-pulse rounded-lg border" />
  ),
});
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/trpc/react";

export function Workspace() {
  const utils = api.useUtils();
  const notes = api.note.list.useQuery();
  const byDay = api.note.countByDay.useQuery();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const create = api.note.create.useMutation({
    onSuccess: async () => {
      setTitle("");
      setContent("");
      setCoords(null);
      await Promise.all([utils.note.list.invalidate(), utils.note.countByDay.invalidate()]);
      toast.success("Note saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const del = api.note.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.note.list.invalidate(), utils.note.countByDay.invalidate()]);
      toast("Note deleted");
    },
  });

  const points: MapPoint[] = (notes.data ?? [])
    .filter((n) => n.lat != null && n.lng != null)
    .map((n) => ({ id: n.id, latitude: n.lat!, longitude: n.lng!, title: n.title }));

  function submit() {
    if (!title.trim()) return toast.error("Give it a title first");
    create.mutate({
      title: title.trim(),
      content,
      lat: coords?.lat,
      lng: coords?.lng,
    });
  }

  return (
    <Tabs defaultValue="build" className="w-full">
      <TabsList>
        <TabsTrigger value="build">Build</TabsTrigger>
        <TabsTrigger value="chat">AI Chat</TabsTrigger>
      </TabsList>

      {/* --- BUILD: tRPC + Prisma + Map + Editor + Chart, all wired --------- */}
      <TabsContent value="build" className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New note</CardTitle>
            <CardDescription>
              Type a title, write rich text, then click the map to pin it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Editor content={content} onChange={setContent} />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {coords
                  ? `📍 ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
                  : "No location — click the map →"}
              </span>
              <Button onClick={submit} disabled={create.isPending}>
                {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save note
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map</CardTitle>
            <CardDescription>Click to set the new note&apos;s location.</CardDescription>
          </CardHeader>
          <CardContent>
            <Map
              points={points}
              onMapClick={({ latitude, longitude }) =>
                setCoords({ lat: latitude, lng: longitude })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes ({notes.data?.length ?? 0})</CardTitle>
            <CardDescription>Live from SQLite via tRPC.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {notes.data?.length === 0 && (
              <p className="text-muted-foreground text-sm">Nothing yet.</p>
            )}
            {notes.data?.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(n.createdAt).toLocaleString()}
                    {n.lat != null && " · 📍"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => del.mutate({ id: n.id })}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes per day</CardTitle>
            <CardDescription>shadcn chart (Recharts).</CardDescription>
          </CardHeader>
          <CardContent>
            <NotesChart data={byDay.data ?? []} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* --- CHAT: streaming AI SDK + Claude ------------------------------- */}
      <TabsContent value="chat" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>AI assistant</CardTitle>
            <CardDescription>
              Streaming, tool-calling &amp; generative UI. Ask for a summary — the
              agent renders an animated card, not text. Pinned notes hit the map live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chat
              onResult={() =>
                void Promise.all([
                  utils.note.list.invalidate(),
                  utils.note.countByDay.invalidate(),
                ])
              }
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

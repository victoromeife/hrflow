// components/messages/message-composer.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/app/(dashboard)/messages/actions";

interface MessageComposerProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageComposer({ conversationId, currentUserId }: MessageComposerProps) {
  const [content, setContent] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError(null);
    const fd = new FormData();
    fd.append("conversationId", conversationId);
    fd.append("content", content.trim());
    const res = await sendMessage(fd);
    if (res?.error) {
      setError(res.error);
    }
    setContent("");
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-800 p-4 flex items-center gap-2">
      <Input
        placeholder="Type a message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={sending || !content.trim()}>
        {sending ? "..." : "Send"}
      </Button>
      {error && <p className="text-xs text-red-400 w-full">{error}</p>}
    </form>
  );
}
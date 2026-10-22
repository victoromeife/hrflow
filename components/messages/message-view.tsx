// components/messages/message-view.tsx
"use client";

import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PaperclipIcon } from "@/components/icons";
import type { Conversation, Message } from "@/app/generated/prisma";

interface MessageWithSender extends Message {
  sender: { id: string; fullName: string; email: string };
  attachments: { id: string; originalName: string; mimeType: string; size: number; storageKey: string }[];
}

interface ConversationWithMessages extends Conversation {
  participants: {
    id: string;
    userId: string | null;
    departmentId: string | null;
    user: { id: string; fullName: string; email: string } | null;
    department: { id: string; name: string } | null;
  }[];
  messages: MessageWithSender[];
}

interface MessageViewProps {
  conversation: ConversationWithMessages;
  currentUserId: string;
}

export function MessageView({ conversation, currentUserId }: MessageViewProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  const sorted = [...conversation.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const formatTime = (d: Date) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (d: Date) => new Date(d).toLocaleDateString();

  let lastDate = "";

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {sorted.length === 0 ? (
        <div className="text-center text-slate-500 py-12">
          No messages yet. Start the conversation!
        </div>
      ) : (
        sorted.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          const dateStr = formatDate(msg.createdAt);
          const showDate = dateStr !== lastDate;
          lastDate = dateStr;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <Badge variant="secondary" className="text-xs">{dateStr}</Badge>
                </div>
              )}
              <div className={cn("flex gap-3", isMine ? "flex-row-reverse" : "flex-row")}>
                {!isMine && (
                  <Avatar src={null} alt={msg.sender.fullName} size="sm" />
                )}
                <div className={cn("max-w-[70%]", isMine ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "inline-block px-3 py-2 rounded-xl text-sm",
                      isMine
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-800 text-slate-100 rounded-tl-none"
                    )}
                  >
                    <span className="text-slate-100">{msg.content || ""}</span>
                  </div>
                  {msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={`/api/files/${encodeURIComponent(att.storageKey)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs",
                            isMine
                              ? "bg-indigo-600/30 border-indigo-500/30"
                              : "bg-slate-800 border-slate-700"
                          )}
                        >
                          <span><PaperclipIcon className="w-3 h-3" /></span>
                          <span className="truncate max-w-[200px]">{att.originalName}</span>
                          <span className="text-slate-400">{(att.size / 1024).toFixed(0)} KB</span>
                        </a>
                      ))}
                    </div>
                  )}
                  <p className={cn("text-xs text-slate-500 mt-1", isMine ? "text-right" : "")}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
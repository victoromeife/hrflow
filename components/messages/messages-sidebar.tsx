// components/messages/messages-sidebar.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquareIcon } from "@/components/icons";
import type { Conversation } from "@/app/generated/prisma";

interface ConversationWithMessages extends Conversation {
  participants: {
    id: string;
    userId: string | null;
    departmentId: string | null;
    user: { id: string; fullName: string; email: string } | null;
    department: { id: string; name: string } | null;
  }[];
  messages: {
    id: string;
    content: string | null;
    createdAt: Date;
    senderId: string;
    sender: { id: string; fullName: string; email: string };
  }[];
}

interface MessagesSidebarProps {
  conversations: ConversationWithMessages[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  getLabel: (conv: ConversationWithMessages) => string;
  getIcon: (conv: ConversationWithMessages) => React.ReactNode;
}

export function MessagesSidebar({ conversations, activeId, onSelect, onNewChat, getLabel, getIcon }: MessagesSidebarProps) {
  const lastMessage = (conv: ConversationWithMessages) => conv.messages[0];

  return (
    <div className="w-80 border-r border-slate-800 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <Button className="w-full" onClick={onNewChat}>
          + New Conversation
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        {conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquareIcon className="w-8 h-8" />}
            title="No conversations"
            description="Start a new conversation to begin messaging."
            action={
              <Button variant="outline" size="sm" onClick={onNewChat}>
                New Conversation
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-slate-800">
            {conversations.map((conv) => {
              const msg = lastMessage(conv);
              const label = getLabel(conv);
              const icon = getIcon(conv);
              const isActive = conv.id === activeId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-slate-800/50 transition flex items-start gap-3",
                    isActive && "bg-slate-800/60"
                  )}
                >
                  <span className="text-lg mt-0.5">{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-100 truncate">{label}</p>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {msg ? (
                        <>
                          <span className="text-slate-500">{msg.sender.fullName}: </span>
                          {msg.content || "Attachment"}
                        </>
                      ) : (
                        "No messages yet"
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
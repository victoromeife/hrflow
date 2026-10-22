// components/messages/messages-client.tsx
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MessagesSidebar } from "./messages-sidebar";
import { MessageView } from "./message-view";
import { MessageComposer } from "./message-composer";
import { UsersIcon, BuildingIcon, MessageSquareIcon } from "@/components/icons";
import type { User, Conversation, Message, Department } from "@/app/generated/prisma";

interface ParticipantUser {
  id: string;
  fullName: string;
  email: string;
}

interface ParticipantDept {
  id: string;
  name: string;
}

interface ConversationWithMessages extends Conversation {
  participants: {
    id: string;
    userId: string | null;
    departmentId: string | null;
    user: ParticipantUser | null;
    department: ParticipantDept | null;
  }[];
  messages: (Message & {
    sender: { id: string; fullName: string; email: string };
    attachments: { id: string; originalName: string; mimeType: string; size: number; storageKey: string }[];
  })[];
}

interface MessagesClientProps {
  user: { id: string; fullName: string; role: string };
  conversations: ConversationWithMessages[];
  users: { id: string; fullName: string; email: string }[];
  departments: { id: string; name: string }[];
}

export function MessagesClient({ user, conversations, users, departments }: MessagesClientProps) {
  const pathname = usePathname();
  const [activeConvId, setActiveConvId] = React.useState<string | null>(null);
  const [showNewChat, setShowNewChat] = React.useState(false);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || null;

  const getConversationLabel = (conv: ConversationWithMessages): string => {
    if (conv.title) return conv.title;
    const other = conv.participants.find((p) => p.userId && p.userId !== user.id);
    return other?.user?.fullName || "Conversation";
  };

  const getConversationIcon = (conv: ConversationWithMessages): React.ReactNode => {
    if (conv.type === "PRIVATE") return <UsersIcon className="w-5 h-5" />;
    if (conv.type === "DEPARTMENT" || conv.type === "DEPARTMENT_TO_EMPLOYEE") return <BuildingIcon className="w-5 h-5" />;
    return <MessageSquareIcon className="w-5 h-5" />;
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
      <MessagesSidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={setActiveConvId}
        onNewChat={() => setShowNewChat(true)}
        getLabel={getConversationLabel}
        getIcon={getConversationIcon}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {activeConversation ? (
          <>
            <div className="h-14 border-b border-slate-800 flex items-center px-5">
              {getConversationIcon(activeConversation)}
              <span className="font-medium text-slate-100 ml-2">{getConversationLabel(activeConversation)}</span>
            </div>
            <MessageView
              conversation={activeConversation}
              currentUserId={user.id}
            />
            <MessageComposer conversationId={activeConversation.id} currentUserId={user.id} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          users={users}
          departments={departments}
          onClose={() => setShowNewChat(false)}
          onCreated={(id) => {
            setShowNewChat(false);
            setActiveConvId(id);
          }}
        />
      )}
    </div>
  );
}
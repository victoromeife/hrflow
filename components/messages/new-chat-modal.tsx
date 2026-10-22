// components/messages/new-chat-modal.tsx
"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { createOrGetPrivateConversation, createDepartmentConversation } from "@/app/(dashboard)/messages/actions";

interface NewChatModalProps {
  users: { id: string; fullName: string; email: string }[];
  departments: { id: string; name: string }[];
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function NewChatModal({ users, departments, onClose, onCreated }: NewChatModalProps) {
  const [mode, setMode] = React.useState<"private" | "department">("private");
  const [selectedId, setSelectedId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreate = async () => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    let res;
    if (mode === "private") {
      res = await createOrGetPrivateConversation(selectedId);
    } else {
      res = await createDepartmentConversation(selectedId);
    }
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.conversationId) {
      onCreated(res.conversationId);
    }
    setLoading(false);
  };

  return (
    <Modal
      open={true}
      onOpenChange={onClose}
      title="New Conversation"
      description="Start a private chat or create a department conversation."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !selectedId}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </>
      }
    >
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={mode === "private" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("private"); setSelectedId(""); }}
        >
          Private
        </Button>
        <Button
          type="button"
          variant={mode === "department" ? "default" : "outline"}
          size="sm"
          onClick={() => { setMode("department"); setSelectedId(""); }}
        >
          Department
        </Button>
      </div>

      {mode === "private" ? (
        <select
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a person...</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName} ({u.email})
            </option>
          ))}
        </select>
      ) : (
        <select
          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">Select a department...</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </Modal>
  );
}
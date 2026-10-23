// components/messages/message-composer.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/app/(dashboard)/messages/actions";
import { useActionState } from "react";

interface MessageComposerProps {
  conversationId: string;
  currentUserId: string;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [state, formAction, pending] = useActionState(sendMessage, {});
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="border-t border-slate-800 p-4 flex flex-col gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <div className="flex items-center gap-2">
        <Input name="content" placeholder="Type a message..." className="flex-1" required />
        <Button type="submit" disabled={pending}>
          {pending ? "..." : "Send"}
        </Button>
      </div>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
    </form>
  );
}
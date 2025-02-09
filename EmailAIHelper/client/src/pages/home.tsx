import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailList } from "@/components/email-list";
import { EmailThread } from "@/components/email-thread";
import { mockEmails } from "@/lib/mock-data";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { Email } from "@shared/schema";

export default function Home() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: emails = [] } = useQuery<Email[]>({
    queryKey: ["/api/emails"],
  });

  const { data: thread = [] } = useQuery<Email[]>({
    queryKey: ["/api/emails", selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const res = await fetch(`/api/emails/${selectedId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch thread");
      }
      return res.json();
    },
    enabled: selectedId !== null,
  });

  const sendReplyMutation = useMutation({
    mutationFn: async (replyText: string) => {
      if (!selectedId) return;
      const lastEmail = thread[thread.length - 1];
      const reply = {
        subject: lastEmail.subject,
        body: replyText,
        fromEmail: lastEmail.toEmail,
        fromName: lastEmail.toName,
        fromAvatar: lastEmail.toAvatar,
        toEmail: lastEmail.fromEmail,
        toName: lastEmail.fromName,
        toAvatar: lastEmail.fromAvatar,
        parentId: lastEmail.id,
      };
      await apiRequest("POST", "/api/emails", reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      queryClient.invalidateQueries({ queryKey: ["/api/emails", selectedId] });
    },
  });

  // Load mock data on first render
  useEffect(() => {
    async function loadMockData() {
      try {
        for (const email of mockEmails) {
          await apiRequest("POST", "/api/emails", email);
        }
        queryClient.invalidateQueries({ queryKey: ["/api/emails"] });
      } catch (error) {
        console.error("Failed to load mock data:", error);
      }
    }
    loadMockData();
  }, [queryClient]);

  return (
    <div className="flex h-screen">
      <div className="w-96 border-r">
        <EmailList
          emails={emails}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
      <div className="flex-1">
        <EmailThread
          thread={thread}
          onSend={async (content) => {
            await sendReplyMutation.mutateAsync(content);
          }}
        />
      </div>
    </div>
  );
}
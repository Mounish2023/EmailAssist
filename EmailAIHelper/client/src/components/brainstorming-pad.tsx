import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "./tiptap-editor";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import type { Email } from "@shared/schema";
import { AIChat } from "./ai-chat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrainstormingPadProps {
  email: Email;
  onSend: (reply: string) => Promise<void>;
}

export function BrainstormingPad({ email, onSend }: BrainstormingPadProps) {
  const [replyContent, setReplyContent] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [isSending, setIsSending] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const { toast } = useToast();

  async function handleSend() {
    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const contentToSend = replyContent; // Store content before clearing
      setReplyContent(""); // Clear content immediately
      await onSend(contentToSend);
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
      setReplyContent(replyContent); // Restore content if send fails
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="border-t bg-muted/30">
      <div className="max-w-[1200px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setShowAIChat(!showAIChat)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            AI Brainstorming
            {showAIChat ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {showAIChat && (
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {showAIChat && (
          <div className="bg-card rounded-lg shadow-sm border">
            <div className="p-4">
              <AIChat
                email={email}
                onCopyToEditor={(text) => setReplyContent(text)}
              />
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm border">
          <div className="p-4">
            <TiptapEditor content={replyContent} onChange={setReplyContent} />
            <div className="flex justify-end mt-4">
              <Button onClick={handleSend} disabled={isSending || !replyContent.trim()}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
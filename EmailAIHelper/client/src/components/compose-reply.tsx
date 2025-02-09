import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TiptapEditor } from "./tiptap-editor";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Send, Wand2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Email } from "@shared/schema";

interface ComposeReplyProps {
  email: Email;
  onClose: () => void;
  onSend: (reply: string) => Promise<void>;
}

export function ComposeReply({ email, onClose, onSend }: ComposeReplyProps) {
  const [content, setContent] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  async function generateReply() {
    setIsGenerating(true);
    try {
      console.log("Generating reply for email:", email.id, "with tone:", tone);
      const res = await apiRequest("POST", "/api/generate-reply", {
        emailId: email.id,
        tone,
      });
      const data = await res.json();
      console.log("Generated reply:", data);
      if (data.reply) {
        setContent(data.reply);
        toast({
          title: "Success",
          description: "Reply generated successfully",
        });
      } else {
        throw new Error("No reply received from API");
      }
    } catch (error: any) {
      console.error("Error generating reply:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate reply",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSend() {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await onSend(content);
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      onClose();
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to {email.fromName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
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

            <Button
              variant="secondary"
              onClick={generateReply}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generate Reply
            </Button>
          </div>

          <TiptapEditor content={content} onChange={setContent} />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Reply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
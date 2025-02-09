import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, MessageSquare, Copy, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Email } from "@shared/schema";

interface Message {
  id: number;
  content: string;
  role: "assistant" | "user";
  timestamp: Date;
}

interface AIChatProps {
  email: Email;
  onCopyToEditor: (text: string) => void;
}

export function AIChat({ email, onCopyToEditor }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState("");
  const [tone, setTone] = useState<string>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const { toast } = useToast();

  async function generateReply(userFeedback?: string) {
    setIsGenerating(true);
    try {
      console.log("Generating reply for email:", email.id, "with tone:", tone);
      const res = await apiRequest("POST", "/api/generate-reply", {
        emailId: email.id,
        tone,
        feedback: userFeedback,
      });
      const data = await res.json();
      console.log("Generated reply:", data);

      if (data.reply) {
        const newMessages = [
          ...messages,
          ...(userFeedback ? [{
            id: messages.length + 1,
            content: userFeedback,
            role: "user" as const,
            timestamp: new Date(),
          }] : []),
          {
            id: messages.length + (userFeedback ? 2 : 1),
            content: data.reply,
            role: "assistant" as const,
            timestamp: new Date(),
          },
        ];
        setMessages(newMessages);
        setFeedback("");
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

  function handleCopy(messageId: number, content: string) {
    onCopyToEditor(content);
    setCopiedMessageId(messageId);
    toast({
      title: "Copied",
      description: "Reply copied to editor",
    });
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  }

  function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    generateReply(feedback);
  }

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div className="p-4 border-b">
        <div className="flex items-center gap-4 mb-4">
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
            onClick={() => generateReply()}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            Generate Initial Reply
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-accent"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {message.role === "assistant" ? "AI Assistant" : "You"}
                  </span>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.id, message.content)}
                      className="h-8 px-2"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmitFeedback} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback for the AI (e.g., 'Make it more concise' or 'Change the greeting')"
            disabled={isGenerating}
          />
          <Button type="submit" disabled={isGenerating || !feedback.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
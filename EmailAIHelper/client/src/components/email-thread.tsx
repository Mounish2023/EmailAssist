import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { Email } from "@shared/schema";
import { BrainstormingPad } from "./brainstorming-pad";

interface EmailThreadProps {
  thread: Email[];
  onSend: (reply: string) => Promise<void>;
}

export function EmailThread({ thread, onSend }: EmailThreadProps) {
  if (thread.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select an email to view
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold">{thread[0].subject}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {thread.map((email) => (
            <Card key={email.id}>
              <CardHeader className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={email.fromAvatar} alt={email.fromName} />
                    <AvatarFallback>
                      {email.fromName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{email.fromName}</p>
                      <span className="text-sm text-muted-foreground">
                        {format(email.timestamp, "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      to {email.toName}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 whitespace-pre-wrap">
                {email.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <BrainstormingPad 
        email={thread[thread.length - 1]} 
        onSend={onSend}
      />
    </div>
  );
}
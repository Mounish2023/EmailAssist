import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { Email } from "@shared/schema";

interface EmailListProps {
  emails: Email[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function EmailList({ emails, selectedId, onSelect }: EmailListProps) {
  return (
    <ScrollArea className="h-screen">
      <div className="space-y-2 p-4">
        {emails.map((email) => (
          <Card
            key={email.id}
            className={`cursor-pointer hover:bg-accent ${
              selectedId === email.id ? "bg-accent" : ""
            }`}
            onClick={() => onSelect(email.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={email.fromAvatar} alt={email.fromName} />
                  <AvatarFallback>
                    {email.fromName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold truncate">{email.fromName}</p>
                    <span className="text-sm text-muted-foreground">
                      {format(email.timestamp, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">{email.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {email.body}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

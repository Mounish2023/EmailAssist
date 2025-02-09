import type { Email } from "@shared/schema";

export const mockEmails: Omit<Email, "id" | "timestamp">[] = [
  {
    subject: "Project Update Meeting",
    body: "Hi team,\n\nLet's schedule a meeting to discuss the latest project updates. How does tomorrow at 2 PM sound?\n\nBest regards,\nSarah",
    fromEmail: "sarah@company.com",
    fromName: "Sarah Wilson",
    fromAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    toEmail: "team@company.com",
    toName: "Project Team",
    toAvatar: "https://images.unsplash.com/photo-1630910561339-4e22c7150093",
    parentId: null,
  },
  {
    subject: "Client Presentation Review",
    body: "Hello David,\n\nI've reviewed the client presentation and made some suggestions. Please take a look and let me know your thoughts.\n\nRegards,\nMike",
    fromEmail: "mike@company.com",
    fromName: "Mike Chen",
    fromAvatar: "https://images.unsplash.com/photo-1507499036636-f716246c2c23",
    toEmail: "david@company.com",
    toName: "David Smith",
    toAvatar: "https://images.unsplash.com/photo-1646617747609-45b466ace9a6",
    parentId: null,
  },
  {
    subject: "New Feature Request",
    body: "Hi Product Team,\n\nWe've received several requests for a new feature from our users. Can we discuss this in our next sprint planning?\n\nThanks,\nEmma",
    fromEmail: "emma@company.com",
    fromName: "Emma Garcia",
    fromAvatar: "https://images.unsplash.com/photo-1628891435222-065925dcb365",
    toEmail: "product@company.com",
    toName: "Product Team",
    toAvatar: "https://images.unsplash.com/photo-1630910561339-4e22c7150093",
    parentId: null,
  }
];

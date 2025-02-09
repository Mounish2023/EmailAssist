import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

interface EmailTableInterface {
  id: number;
  subject: string;
  body: string;
  fromEmail: string;
  fromName: string;
  fromAvatar: string;
  toEmail: string;
  toName: string;
  toAvatar: string;
  timestamp: Date;
  parentId: number | null;
}

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull(),
  fromAvatar: text("from_avatar").notNull(),
  toEmail: text("to_email").notNull(),
  toName: text("to_name").notNull(),
  toAvatar: text("to_avatar").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  parentId: integer("parent_id").references((): any => emails.id),
});

export const insertEmailSchema = createInsertSchema(emails).omit({ 
  id: true,
  timestamp: true 
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;

// Add the feedback field to the generate reply schema
export const generateReplySchema = z.object({
  emailId: z.number(),
  tone: z.enum(['professional', 'friendly', 'formal']),
  feedback: z.string().optional(),
});

export type GenerateReplyRequest = z.infer<typeof generateReplySchema>;
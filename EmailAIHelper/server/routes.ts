import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { generateEmailReply } from "./openai";
import { generateReplySchema, insertEmailSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/emails", async (req, res) => {
    const emails = await storage.getEmails();
    res.json(emails);
  });

  app.get("/api/emails/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid email ID" });
      return;
    }
    const thread = await storage.getEmailThread(id);
    if (thread.length === 0) {
      res.status(404).json({ message: "Email not found" });
      return;
    }
    res.json(thread);
  });

  app.post("/api/emails", async (req, res) => {
    const parseResult = insertEmailSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ message: "Invalid email data" });
      return;
    }
    const email = await storage.createEmail(parseResult.data);
    res.json(email);
  });

  app.post("/api/generate-reply", async (req, res) => {
    try {
      const parseResult = generateReplySchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ message: "Invalid request" });
        return;
      }

      const { emailId, tone, feedback } = parseResult.data;
      const thread = await storage.getEmailThread(emailId);
      if (thread.length === 0) {
        res.status(404).json({ message: "Email thread not found" });
        return;
      }

      const threadText = thread
        .map(email => `From: ${email.fromName}\nBody: ${email.body}`)
        .join("\n\n");

      const reply = await generateEmailReply(threadText, tone, feedback);
      res.json(reply);
    } catch (error: any) {
      console.error("Generate reply error:", error);
      res.status(500).json({ message: error.message || "Failed to generate reply" });
    }
  });

  return httpServer;
}
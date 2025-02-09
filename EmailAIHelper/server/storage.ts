import type { Email, InsertEmail } from "@shared/schema";

export interface IStorage {
  getEmails(): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  getEmailThread(id: number): Promise<Email[]>;
  createEmail(email: InsertEmail): Promise<Email>;
}

export class MemStorage implements IStorage {
  private emails: Map<number, Email>;
  private currentId: number;

  constructor() {
    this.emails = new Map();
    this.currentId = 1;
  }

  async getEmails(): Promise<Email[]> {
    return Array.from(this.emails.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async getEmailThread(id: number): Promise<Email[]> {
    const email = await this.getEmail(id);
    if (!email) return [];

    const thread: Email[] = [email];
    let currentEmail = email;

    // Get parent emails
    while (currentEmail.parentId) {
      const parent = await this.getEmail(currentEmail.parentId);
      if (parent) {
        thread.unshift(parent);
        currentEmail = parent;
      } else {
        break;
      }
    }

    // Get child emails
    const children = Array.from(this.emails.values()).filter(
      e => e.parentId === id
    );
    thread.push(...children);

    return thread;
  }

  async createEmail(email: InsertEmail): Promise<Email> {
    const id = this.currentId++;
    const newEmail = {
      ...email,
      id,
      timestamp: new Date(),
      parentId: email.parentId ?? null,
    } as Email;
    this.emails.set(id, newEmail);
    return newEmail;
  }
}

export const storage = new MemStorage();
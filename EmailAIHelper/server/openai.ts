import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmailReply(
  emailThread: string,
  tone: string,
  feedback?: string
): Promise<{ reply: string }> {
  try {
    const systemContent = feedback
      ? `You are an email assistant. A user has requested changes to your previous reply. Apply the following feedback while maintaining a ${tone} tone: "${feedback}". Respond with JSON in this format: { "reply": "generated reply text" }`
      : `You are an email assistant. Generate a reply to the email thread below in a ${tone} tone. The reply should be contextual, concise, and maintain the appropriate level of formality. Focus on addressing the key points in the most recent email. Respond with JSON in this format: { "reply": "generated reply text" }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: emailThread,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response generated");
    }

    return JSON.parse(content) as { reply: string };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to generate email reply: " + (error?.message || "Unknown error"));
  }
}
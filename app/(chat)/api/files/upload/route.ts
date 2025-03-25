import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";  // Use Google's Gemini AI for answering doubts
import { auth } from "@/app/(auth)/auth";
import {
  saveChat,
  deleteChatById,
  getChatById,
} from "@/db/queries";  // Database functions
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Convert messages & filter empty ones
  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  // AI Response: Answer student doubts
  const result = await streamText({
    model: geminiProModel,
    system: `\n
        - You are an AI tutor designed to help students with their doubts.
        - Provide clear and concise answers to academic questions.
        - Keep answers short but informative.
        - If needed, ask follow-up questions to clarify the student's doubt.
        - Do NOT generate code unless explicitly asked.
        - If a student asks for an explanation, provide step-by-step reasoning.
        - Assume the student wants answers related to school/college subjects.
        - Today's date is ${new Date().toLocaleDateString()}.
      `,
    messages: coreMessages,
    tools: {
      solveDoubt: {
        description: "Provide an academic answer to a student's question",
        parameters: z.object({
          question: z.string().describe("The student's question"),
        }),
        execute: async ({ question }) => {
          // Example response from AI (Can be replaced with API call to Gemini)
          return {
            answer: `The answer to your question is... (AI-generated response)`,
          };
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

// Handle deleting student chats (if needed)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
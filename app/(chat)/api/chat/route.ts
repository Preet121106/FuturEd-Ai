import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateDoubtSolution,
  generateRelatedQuestions,
  generateQuizFromDoubts,
} from "@/ai/actions";

import { auth } from "@/app/(auth)/auth";
import {
  createStudySession,
  deleteChatById,
  getChatById,
  getStudySessionById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `\n
        - Keep responses concise and focused on study-related topics.
        - DO NOT output lists.
        - After every tool call, summarize the result in a phrase.
        - Today's date is ${new Date().toLocaleDateString()}.
        - Ask follow-up questions to guide the user effectively.
        - Assume the user is preparing for an academic exam or technical assessment.
        - Here’s the optimal study flow:
          - Identify doubts
          - Generate solutions for the doubts
          - Explore related questions
          - Generate a practice quiz
          - Create a structured study plan
          - Track study progress (ask if the session is completed)
      `,
    messages: coreMessages,
    tools: {
      solveDoubt: {
        description: "Solves a given academic or technical doubt",
        parameters: z.object({
          previousQuestions: z.array(z.string()).describe("List of related previous doubts"),
        }),
        execute: async ({ previousQuestions }) => {
          return await generateDoubtSolution({ question: previousQuestions.join(" ") }); 
        },
      },
      relatedQuestions: {
        description: "Generates related questions to a given doubt",
        parameters: z.object({
          previousQuestions: z.array(z.string()).describe("List of related previous doubts"),
        }),
        execute: async ({ previousQuestions }) => {
          return await generateRelatedQuestions({ question: previousQuestions.join(" ") }); 
        },
      },
      quizFromDoubt: {
        description: "Creates a short quiz based on a user's doubt",
        parameters: z.object({
          previousQuestions: z.array(z.string()).describe("List of related previous doubts"),
        }),
        execute: async ({ previousQuestions }) => {
          return await generateQuizFromDoubts({ previousQuestions }); 
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

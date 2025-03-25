import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

// 📌 Generate an AI-powered doubt solution
export async function generateDoubtSolution({
  question,
}: {
  question: string;
}) {
  const { object: doubtSolution } = await generateObject({
    model: geminiFlashModel,
    prompt: `Solve the following academic doubt:\n\n"${question}"\n\n Provide a clear and structured answer.`,
    schema: z.object({
      subject: z
        .string()
        .describe("Subject category, e.g., Math, Physics, Computer Science"),
      explanation: z
        .string()
        .describe("Detailed explanation of the doubt"),
      stepByStep: z
        .array(z.string())
        .describe("Step-by-step breakdown of the solution (if applicable)"),
    }),
  });

  return doubtSolution;
}

// 📌 Generate related questions for deeper learning
export async function generateRelatedQuestions({
  question,
}: {
  question: string;
}) {
  const { object: relatedQuestions } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate 3 related academic questions based on this doubt: "${question}"`,
    output: "array",
    schema: z.array(
      z.object({
        question: z.string().describe("A related academic question"),
      })
    ),
  });

  return { relatedQuestions };
}

// 📌 Simulate a quiz from past doubts
export async function generateQuizFromDoubts({
  previousQuestions,
}: {
  previousQuestions: string[];
}) {
  const { object: quizQuestions } = await generateObject({
    model: geminiFlashModel,
    prompt: `Create a mini-quiz using these past doubts:\n\n${JSON.stringify(
      previousQuestions,
      null,
      2
    )}\n\n Include multiple-choice options.`,
    output: "array",
    schema: z.array(
      z.object({
        question: z.string().describe("Quiz question"),
        options: z
          .array(z.string())
          .describe("Multiple-choice answer options"),
        correctAnswer: z.string().describe("Correct answer from the options"),
      })
    ),
  });

  return { quiz: quizQuestions };
}
import { createServerFn } from "@tanstack/react-start";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const QuestionSchema = z.object({
  question: z.coerce.string().describe("The question text"),
  type: z
    .coerce.string()
    .describe("One of: mcq, short, essay, fill_blank, true_false, matching, structured"),
  options: z
    .array(z.coerce.string())
    .default([])
    .describe("Answer options for MCQ/true_false/matching. Empty array if not applicable."),
  answer: z.coerce.string().describe("The correct answer (full text, not a letter)"),
  explanation: z.coerce.string().describe("Why the answer is correct"),
  steps: z
    .array(z.coerce.string())
    .default([])
    .describe("Step-by-step working for Mathematics. Empty array if not applicable."),
});

const QuizSchema = z.object({
  title: z.coerce.string(),
  curriculumNote: z.coerce.string(),
  questions: z.array(QuestionSchema).min(1),
});

const MAX_OUTPUT_TOKENS = 8_000;

function extractLikelyJson(text: string) {
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd > objectStart) {
    cleaned = cleaned.slice(objectStart, objectEnd + 1);
  }

  return cleaned;
}


const InputSchema = z.object({
  mode: z.enum(["topic", "passage"]),
  subject: z.string().optional(),
  topic: z.string().optional(),
  level: z.string().optional(),
  passage: z.string().optional(),
  count: z.number().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "difficult"]),
  questionType: z.enum(["mcq", "short", "essay", "fill_blank", "true_false", "matching", "structured", "mixed"]),
});

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const isMath = (data.subject ?? "").toLowerCase().includes("math");

    const system = `You are StudyForge, an expert Kenyan curriculum AI tutor. Generate high-quality educational assessments aligned with CBC/CBE, KNEC, and KCSE standards. For university-level requests, use professional academic formatting.

Rules:
- Factually accurate, curriculum-relevant, age-appropriate.
- Encourage critical thinking; avoid repetitive questions.
- For Mathematics, ALWAYS include detailed step-by-step solutions in the "steps" field, with formulas and KNEC-style working.
- For MCQs, always provide exactly 4 options labeled A-D inside the "options" array (no letter prefix) and put the FULL correct option text in "answer".
- For true/false, "options" = ["True", "False"], "answer" is "True" or "False".
- For every non-Mathematics question, return "steps" as an empty array.
- For every non-choice question, return "options" as an empty array.
- Return only the structured object requested by the schema. Do not include markdown, code fences, labels, comments, or any text outside the object.
- Explanations must clarify reasoning and reference the concept tested.`;

    const prompt =
      data.mode === "topic"
        ? `Generate ${data.count} ${data.difficulty} ${data.questionType === "mixed" ? "mixed-type" : data.questionType} questions for:
Subject: ${data.subject}
Topic: ${data.topic}
Level: ${data.level}
${isMath ? "Provide full step-by-step solutions for every question." : ""}`
        : `Read the passage below and generate ${data.count} ${data.difficulty} ${data.questionType === "mixed" ? "mixed-type" : data.questionType} questions that test understanding, analysis, application, and recall.

Passage:
"""
${data.passage}
"""`;

    try {
      const { object, finishReason, usage } = await generateObject({
        model,
        system,
        prompt,
        schema: QuizSchema,
        schemaName: "StudyForgeQuiz",
        schemaDescription:
          "A curriculum-aligned quiz with a title, curriculum note, and complete questions including answer explanations.",
        temperature: 0.2,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        experimental_repairText: async ({ text }) => extractLikelyJson(text),
      });

      if (finishReason === "length") {
        console.warn("StudyForge quiz generation reached the output limit", { usage });
      }

      return object;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        console.error("StudyForge AI structured output failed", {
          cause: error.cause,
          finishReason: error.finishReason,
          usage: error.usage,
          textPreview: error.text?.slice(0, 800),
        });

        throw new Error(
          "The AI response was incomplete or not in the expected quiz format. Please try again with fewer questions or a shorter passage.",
        );
      }

      throw error;
    }
  });


export type Quiz = z.infer<typeof QuizSchema>;
export type Question = z.infer<typeof QuestionSchema>;

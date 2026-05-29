import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const QuestionSchema = z.object({
  question: z.string().describe("The question text"),
  type: z
    .string()
    .describe("One of: mcq, short, essay, fill_blank, true_false, matching, structured"),
  options: z
    .array(z.string())
    .describe("Answer options for MCQ/true_false/matching. Empty array if not applicable."),
  answer: z.string().describe("The correct answer (full text, not a letter)"),
  explanation: z.string().describe("Why the answer is correct"),
  steps: z
    .array(z.string())
    .describe("Step-by-step working for Mathematics. Empty array if not applicable."),
});

const QuizSchema = z.object({
  title: z.string(),
  curriculumNote: z.string(),
  questions: z.array(QuestionSchema),
});


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

    const { object } = await generateObject({
      model,
      system,
      prompt,
      schema: QuizSchema,
      mode: "json",
    });

    return object;
  });


export type Quiz = z.infer<typeof QuizSchema>;
export type Question = z.infer<typeof QuestionSchema>;

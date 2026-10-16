// Core AI pipeline for the Asgardians resume tool. Pure functions over the
// AI SDK — no HTTP or DB concerns — so routes and scripts share one engine.
import { generateText, Output } from "ai";
import { z } from "zod";
import { asgardiansModel } from "./ai";
import {
  enhancementSchema,
  evaluationSchema,
  resumeAnalysisSchema,
  resumeDataSchema,
  type Enhancement,
  type Evaluation,
  type ResumeAnalysis,
  type ResumeData,
} from "./types";

export const MAX_ITERATIONS = 3;
export const PASS_SCORE = 88;

const ENHANCE_SYSTEM = [
  "You are the resume enhancement engine for Mjolnir Design Studios' Asgardians HR system.",
  "Rewrite the resume to maximize performance in HR screening / ATS tools while staying 100% truthful:",
  "- NEVER invent employers, titles, dates, degrees, certifications, or metrics.",
  "- Strengthen bullets into achievement statements (action verb + scope + outcome), quantifying only with numbers already present.",
  "- Weave in the missing high-value keywords for the target roles where they honestly apply.",
  "- Reorganize to the highest-performing section order: Contact, Summary, Experience, Skills, Education, Certifications.",
  "- Write a sharp professional headline and a tight 3-4 line summary rich in role keywords.",
  "- Keep total content volume to what fits TWO pages: trim redundant bullets, condense oldest roles to 1-2 bullets, drop filler.",
  "- Use standard section names and plain formatting so ATS parsers never stumble.",
].join("\n");

export async function analyzeResumeFile(
  bytes: Uint8Array,
  mediaType: string,
): Promise<{ extracted: ResumeData; analysis: ResumeAnalysis }> {
  const { output } = await generateText({
    model: asgardiansModel(),
    output: Output.object({
      schema: z.object({ extracted: resumeDataSchema, analysis: resumeAnalysisSchema }),
    }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text" as const,
            text: [
              "You are the resume intake engine for Mjolnir Design Studios' Asgardians HR system.",
              "Extract this resume into the structured schema EXACTLY as written — do not invent,",
              "embellish, or omit content. Preserve every job, bullet, date, credential, and skill.",
              "Then analyze it for ATS (applicant tracking system) readiness: target roles,",
              "strengths, weaknesses, parsing issues, and missing high-value keywords.",
            ].join(" "),
          },
          mediaType === "text/plain"
            ? { type: "text" as const, text: new TextDecoder().decode(bytes) }
            : { type: "file" as const, data: bytes, mediaType },
        ],
      },
    ],
  });
  return output;
}

export type EnhanceRunResult = {
  enhancement: Enhancement;
  evaluation: Evaluation;
  iterations: number;
};

export async function enhanceResume(
  extracted: ResumeData,
  analysis?: ResumeAnalysis,
  targetRole?: string,
  onIteration?: (i: number, evaluation: Evaluation) => void,
): Promise<EnhanceRunResult> {
  const model = asgardiansModel();
  let enhancement: Enhancement | null = null;
  let evaluation: Evaluation | null = null;
  let iterations = 0;
  let feedback: string[] = [];

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const previousAttempt: string = enhancement
      ? `YOUR PREVIOUS ATTEMPT:\n${JSON.stringify((enhancement as Enhancement).resume)}`
      : "";
    const enhanceResult = await generateText({
      model,
      output: Output.object({ schema: enhancementSchema }),
      instructions: ENHANCE_SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            targetRole ? `Target role: ${targetRole}` : "",
            `ORIGINAL RESUME (source of truth):\n${JSON.stringify(extracted)}`,
            analysis ? `INTAKE ANALYSIS:\n${JSON.stringify(analysis)}` : "",
            previousAttempt,
            feedback.length
              ? `EVALUATOR FEEDBACK TO FIX THIS ROUND:\n- ${feedback.join("\n- ")}`
              : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    });
    const attempt: Enhancement = enhanceResult.output;
    enhancement = attempt;

    const evalResult = await generateText({
      model,
      output: Output.object({ schema: evaluationSchema }),
      instructions: [
        "You are a strict, adversarial resume evaluator simulating enterprise ATS screening.",
        `Score 0-100. passes = atsScore >= ${PASS_SCORE} AND fitsTwoPages AND truthful.`,
        "Check truthfulness by comparing against the ORIGINAL — any invented employer, date,",
        "degree, or metric means truthful=false. Estimate two-page fit from content volume",
        "(roughly: summary + up to ~30 experience bullets + skills/education/certs).",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            `ORIGINAL RESUME:\n${JSON.stringify(extracted)}`,
            `ENHANCED RESUME TO EVALUATE:\n${JSON.stringify(attempt.resume)}`,
            targetRole ? `Target role: ${targetRole}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    });
    evaluation = evalResult.output;
    onIteration?.(iterations, evaluation);

    if (evaluation.passes) break;
    feedback = evaluation.issues;
  }

  return { enhancement: enhancement!, evaluation: evaluation!, iterations };
}

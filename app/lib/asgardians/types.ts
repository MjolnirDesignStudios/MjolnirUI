import { z } from "zod";

// Canonical resume shape shared by extraction, enhancement, and export.
export const resumeDataSchema = z.object({
  contact: z.object({
    fullName: z.string(),
    headline: z.string().nullish(),
    location: z.string().nullish(),
    phone: z.string().nullish(),
    email: z.string().nullish(),
    links: z.array(z.string()).nullish(),
  }),
  summary: z.string(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string().nullish(),
      location: z.string().nullish(),
      startDate: z.string().nullish(),
      endDate: z.string().nullish(),
      bullets: z.array(z.string()),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string().nullish(),
      date: z.string().nullish(),
      details: z.array(z.string()).nullish(),
    }),
  ),
  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().nullish(),
      date: z.string().nullish(),
    }),
  ),
  skills: z.array(z.string()),
  interests: z.array(z.string()).nullish(),
});
export type ResumeData = z.infer<typeof resumeDataSchema>;

export const resumeAnalysisSchema = z.object({
  targetRoles: z.array(z.string()).describe("Roles this candidate is best positioned for"),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  atsIssues: z.array(z.string()).describe("Formatting/content issues that hurt ATS parsing or ranking"),
  keywordGaps: z.array(z.string()).describe("High-value keywords for the target roles that are missing"),
  overallScore: z.number().min(0).max(100).describe("Current ATS-readiness score, 0-100"),
});
export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;

export const enhancementSchema = z.object({
  resume: resumeDataSchema,
  keywordsAdded: z.array(z.string()),
  changeLog: z.array(z.string()).describe("Human-readable list of what was changed and why"),
});
export type Enhancement = z.infer<typeof enhancementSchema>;

export const evaluationSchema = z.object({
  atsScore: z.number().min(0).max(100),
  fitsTwoPages: z.boolean().describe("Whether the content volume fits a standard two-page layout"),
  truthful: z.boolean().describe("No fabricated employers, dates, degrees, or metrics vs the original"),
  issues: z.array(z.string()).describe("Remaining problems to fix; empty when excellent"),
  passes: z.boolean().describe("True when atsScore >= 88, fitsTwoPages, and truthful"),
});
export type Evaluation = z.infer<typeof evaluationSchema>;

export const jobMatchSchema = z.object({
  matches: z
    .array(
      z.object({
        title: z.string(),
        company: z.string().nullish(),
        url: z.string().nullish(),
        location: z.string().nullish(),
        salaryRange: z.string().nullish(),
        remote: z.boolean().nullish(),
        score: z.number().min(0).max(100),
        rationale: z.string().describe("One or two sentences on why this role fits the credentials"),
      }),
    )
    .max(10),
});
export type JobMatches = z.infer<typeof jobMatchSchema>;

export type AssociateStatus = "applicant" | "screening" | "enhanced" | "onboarded" | "asgardian";

import { anthropic } from "@ai-sdk/anthropic";

// Single place to swap the model powering the Asgardians pipeline.
export function asgardiansModel() {
  return anthropic(process.env.ASGARDIANS_MODEL ?? "claude-sonnet-5");
}

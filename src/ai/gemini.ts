// ===== SESSION 11: a NEW file =======================================
// ===== no Session 10 version -- nothing to compare it to ============
import { GoogleGenAI, type Content } from "@google/genai";
import { MODEL, SYSTEM_PROMPT, EXAMPLES, wrap } from "./prompt";
import {
  reviewSchema,
  reviewJsonSchema,
  type Review,
} from "../schemas/review";

// Thrown when Gemini answered but the answer is unusable. The route
// turns it into a 502; anything else stays a 500.
export class AiReplyError extends Error {}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing. Add it to .env, and to Vercel.",
    );
  }

  if (client === null) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

function buildContents(description: string): Content[] {
  const shots: Content[] = EXAMPLES.flatMap((example) => [
    { role: "user", parts: [{ text: wrap(example.description) }] },
    {
      role: "model",
      parts: [{ text: JSON.stringify(example.review) }],
    },
  ]);

  return [
    ...shots,
    { role: "user", parts: [{ text: wrap(description) }] },
  ];
}

export async function reviewProject(
  description: string,
): Promise<Review> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: buildContents(description),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      // JSON in exactly this shape. Without these two lines the
      // reply is prose, and prose cannot be put on a screen field by field.
      responseMimeType: "application/json",
      responseJsonSchema: reviewJsonSchema,
      // No temperature here on purpose. Google's guide for the
      // Gemini 3 models says to leave it at its default of 1.0.
    },
  });

  // Check 1: Is there any text?
  // undefined when there is no text at all -- for example a reply
  // that was blocked by Gemini's safety filters.
  const text = response.text;
  if (!text) {
    throw new AiReplyError("Gemini sent back no text");
  }

  // Check 2: Is it JSON?
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new AiReplyError("Gemini's reply was not JSON");
  }

  // Check 3: Does it match reviewSchema?
  // The schema was a request, and this is the check.
  const result = reviewSchema.safeParse(data);
  if (!result.success) {
    throw new AiReplyError("Gemini's reply did not match the schema");
  }

  return result.data;
}
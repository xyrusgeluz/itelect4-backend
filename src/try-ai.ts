// ===== SESSION 11: a NEW file =======================================
// ===== no Session 10 version -- nothing to compare it to ============
import "dotenv/config";
import { reviewProject } from "./ai/gemini";

// npm run try-ai — one real request to Gemini from your terminal.
// No Express, no token, no database.
// If this prints a review, the key, the model name, and the schema
// all work. Any later failure is in the Express half.
async function tryAi() {
  const review = await reviewProject(
    // Adapted for YOUR project: a Lost & Found app, not a course tracker
    "A Lost and Found web application built with React and TypeScript. " +
    "Students can report lost or found items, browse the item list, " +
    "and submit claims with a proof URL. The API is Express with " +
    "MongoDB Atlas, deployed on Vercel. Authentication uses JWT.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
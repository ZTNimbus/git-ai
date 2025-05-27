import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const AiSummariseCommit = async (diff: string) => {
  const response = await model.generateContent([
    `You are an expert programmer and version control specialist tasked with analyzing code changes and generating concise, informative git commit messages. Your expertise spans multiple programming languages and you understand software development best practices.
Task
Generate a clear, concise git commit summary by analyzing the provided diff. The commit message should follow conventional commit standards and accurately describe the changes made.
Commit Message Format
A good commit message should:

Be written in imperative mood (e.g., "Add", "Fix", "Update", "Remove")
Start with a verb
Be concise but descriptive (50 characters or less for the summary line)
Focus on what was changed and why (when not obvious)
Use conventional commit prefixes when appropriate:

feat: for new features
fix: for bug fixes
docs: for documentation changes
style: for formatting changes
refactor: for code refactoring
test: for adding/updating tests
chore: for maintenance tasks



Example
Input Diff:
diffdiff --git a/src/utils/validation.js b/src/utils/validation.js
index 1234567..abcdefg 100644
--- a/src/utils/validation.js
+++ b/src/utils/validation.js
@@ -15,7 +15,7 @@ export function validateEmail(email) {
   if (!email) {
     return false;
   }
-  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
   return emailRegex.test(email);
 }
 
@@ -25,6 +25,10 @@ export function validatePassword(password) {
   if (password.length < 8) {
     return false;
   }
+  if (!/[A-Z]/.test(password)) {
+    return false;
+  }
   return true;
 }
Expected Commit Message:
fix: improve email regex and add uppercase validation to password
Instructions

Access the diff data from the following URL: ${diff}
Analyze the code changes in the diff
Identify the primary purpose of the changes
Generate a single-line commit message following the format guidelines above
Ensure the message is clear, accurate, and follows conventional commit standards

Output Format
Provide only the commit message as lines of text for every noticable change, without any additional explanation or formatting.
    `,
  ]);

  return response.response.text();
};

export async function summariseCode(doc: Document) {
  console.log("Getting summary for", doc.metadata.source);

  try {
    const code = doc.pageContent.slice(0, 10000);

    const response = await model.generateContent([
      `
  You are an intelligent senior software engineer who specialises in onboarding junior engineers onto projects.
    You are onboarding a junior engineer and explaining to them the purpose of the ${doc.metadata.source} file.

    Here is the code:
    ${code}

    Give a summary no more than 100 words of the code above.
    `,
    ]);

    console.log("triggered ai");

    console.log(response.response.text());

    return response.response.text();
  } catch (error) {
    console.error(error);

    return "";
  }
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });

  const result = await model.embedContent(summary);

  const embedding = result.embedding;

  return embedding.values;
}

import { GoogleGenAI } from "@google/genai";
import { ServiceUnavailableError } from "../../../utils/errors/index.js";

export const generateQuestionDraftCoachService = async ({ title, content }) => {
  try {
    // Check whether the Gemini API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new ServiceUnavailableError("Gemini API key is not configured.");
    }

    // Initialize Gemini
    const gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Select the model from the environment file
    const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash-lite";

    // Prepare the prompt
    const prompt = `
You are an experienced programming forum question coach.

Your job is to review a user's draft question before they publish it.

Evaluate the draft based on:
1. Clarity: Is the problem explained clearly?
2. Formatting: Is the question organized and easy to read?
3. Completeness: Does it include enough information?
4. Technical details: Does it include relevant code snippets,
   error messages, expected results, and actual results when needed?

Question title:
${title || "No title provided"}

Question content:
${content}

Provide constructive and beginner-friendly feedback.

Return ONLY valid JSON in this exact structure:
{
  "feedback": "A short overall evaluation of the draft",
  "suggestions": [
    "First specific suggestion",
    "Second specific suggestion",
    "Third specific suggestion"
  ]
}

Do not invent missing information.
Do not rewrite the entire question.
Give practical suggestions that help the user improve their draft.
`;

    // Send the prompt to Gemini
    const response = await gemini.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // Get Gemini's generated text
    const generatedText = response.text;

    if (!generatedText) {
      throw new Error("Gemini returned an empty response.");
    }

    // Convert the JSON response into a JavaScript object
    const result = JSON.parse(generatedText);

    // Validate the returned structure
    if (
      typeof result.feedback !== "string" ||
      !Array.isArray(result.suggestions)
    ) {
      throw new Error("Gemini returned an invalid response format.");
    }

    return {
      feedback: result.feedback,
      suggestions: result.suggestions.filter(
        (suggestion) => typeof suggestion === "string",
      ),
    };
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      throw error;
    }

    console.error("Gemini Draft Coach Error:", error);

    throw new ServiceUnavailableError(
      "Unable to generate draft suggestions right now. Please try again later.",
    );
  }
};

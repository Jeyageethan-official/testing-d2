const functions = require("firebase-functions");
const { GoogleGenAI } = require("@google/genai");

// IMPORTANT: Set your API key in the Firebase environment configuration.
// Run this command in your terminal:
// firebase functions:config:set gemini.key="YOUR_API_KEY"
const API_KEY = functions.config().gemini.key;

let ai;
if (API_KEY) {
  ai = new GoogleGenAI({apiKey: API_KEY});
} else {
  console.error("Gemini API key is not configured in Firebase Functions environment.");
}

exports.getProfessionalMessage = functions.https.onCall(async (data, context) => {
  if (!ai) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The AI service is not configured correctly."
    );
  }

  const userInput = data.text;
  if (!userInput || typeof userInput !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with one argument 'text' containing the message to process."
    );
  }

  try {
    const prompt = `You are an expert professional communication assistant. A user will provide a message in 'Tanglish' (a mix of Tamil and English). Your task is to convert this message into a short, polite, clear, and grammatically correct professional English message suitable for sending to a manager or a higher-ranking officer. Detect the tone, purpose, and reason from the user's text.
    
    Example Input: "sir naan inniku office varamudiyathu health illa"
    Example Output: "Sir, I’m not feeling well today, so I won’t be able to come to the office."

    Example Input: "mam nalaiku leave venum, function iruku"
    Example Output: "Madam, I would like to request a day of leave for tomorrow as I have a function to attend."

    User's message: "${userInput}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate professional message."
    );
  }
});

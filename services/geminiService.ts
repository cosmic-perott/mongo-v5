import { GoogleGenAI, Chat } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../constants.ts';

// Initialize the SDK. Assumes process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

let chatSession: Chat | null = null;

export const initChat = () => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Slightly creative but focused
    },
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (session: Chat, message: string, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await session.sendMessageStream({ message });
    } catch (error: any) {
      attempt++;
      const status = error?.status || error?.response?.status;
      
      // Retry on 429 (Too Many Requests) or 5xx (Server Errors)
      if (attempt >= maxRetries || (status && status !== 429 && status < 500)) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      console.warn(`API error (${status || 'unknown'}). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt} of ${maxRetries})`);
      await sleep(delay);
    }
  }
  throw new Error("Max retries reached");
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) {
    initChat();
  }
  
  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    const responseStream = await fetchWithRetry(chatSession, message);
    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};

import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); as per guidelines.
// The API key is obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

let chatSession: Chat | null = null;

export interface AcademicContext {
  attendance: { course: string; percentage: number }[];
  pendingTasks: { title: string; due: string }[];
  cgpa: number;
}

export const initializeChat = (studentName: string, branch: string, context?: AcademicContext) => {
  let contextInfo = '';
  const isNinePointer = context && context.cgpa >= 9.0;

  if (context) {
    const lowAttendance = context.attendance.filter(c => c.percentage < 75);
    contextInfo = `
    CURRENT STUDENT CONTEXT:
    - Name: ${studentName}
    - Branch: ${branch}
    - CGPA: ${context.cgpa}
    - 9-Pointer Status: ${isNinePointer ? 'YES (Exempt from attendance)' : 'NO (Must maintain 75%)'}
    - Low Attendance Courses (<75%): ${!isNinePointer && lowAttendance.length > 0 ? lowAttendance.map(c => `${c.course} (${c.percentage}%)`).join(', ') : 'None or Exempt.'}
    - Pending Tasks: ${context.pendingTasks.length > 0 ? context.pendingTasks.map(t => `${t.title} (Due: ${t.due})`).join(', ') : 'None'}
    `;
  } else {
    contextInfo = `Student Name: ${studentName}, Branch: ${branch}`;
  }

  const systemInstruction = `You are Selpha (Self-Learning Personal Assistant), an advanced AI academic mentor for a student at Vellore Institute of Technology (VIT).

  ${contextInfo}

  Your Capabilities & Responsibilities:
  1. **Subject Matter Expert**: Provide deep, accurate, and simplified explanations for complex engineering concepts relevant to the student's branch (${branch}). Use analogies and examples.
  2. **Academic Strategist**: Help plan for VIT exams (CAT1, CAT2, FAT). Prioritize study topics based on the student's tasks and performance.
  3. **Attendance Guardian**: VIT has a strict 75% attendance rule. 
     - **CRITICAL**: If the student's CGPA is >= 9.0, they are a "9-Pointer" and are **EXEMPT** from the 75% attendance rule. Do not warn them about low attendance unless they ask specifically.
     - If CGPA < 9.0, warn the student if any course is below 75% and help calculate classes needed.
  4. **Code & Math Assistant**: If asked for code, provide clean, commented, and efficient solutions. Verify mathematical steps.

  Personality:
  - Intelligent, Proactive, Encouraging, and Precise.
  - Do not be generic. Be specific to the student's context.

  Format:
  - Use **Markdown** effectively (headers, bolding, lists, code blocks).
  - Keep responses concise unless asked for a detailed explanation.
  `;

  // Use gemini-3-pro-preview for complex academic tasks involving reasoning, math, and STEM as per guidelines.
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview', 
    config: {
      systemInstruction,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (text: string): Promise<AsyncGenerator<string, void, unknown>> => {
  // We assume the API_KEY is pre-configured and valid as per guidelines.
  if (!chatSession) {
    throw new Error("AI_NOT_INITIALIZED");
  }

  try {
    const result = await chatSession.sendMessageStream({ message: text });
    
    // Return a generator that yields text chunks
    async function* streamGenerator() {
      for await (const chunk of result) {
        // Correctly accessing the .text property (not method) from GenerateContentResponse as per guidelines.
        const textChunk = chunk.text;
        if (textChunk) {
          yield textChunk;
        }
      }
    }
    
    return streamGenerator();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
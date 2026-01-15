import { GoogleGenAI, Type } from "@google/genai";
import { CourseContent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * The Researcher Agent uses Google Search to find up-to-date information.
 */
export const runResearcherAgent = async (topic: string): Promise<{ text: string; sources: any[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are an expert academic researcher. 
      Your task is to gather comprehensive, accurate, and structured information about the topic: "${topic}".
      Focus on finding key concepts, historical context, current state of the art, and fundamental principles.
      
      Format the output as a detailed research brief.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 1024 }, // Enable some thinking for better research planning
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "No research data found.",
      sources
    };
  } catch (error) {
    console.error("Researcher Agent Error:", error);
    throw new Error("Researcher agent failed to gather information.");
  }
};

/**
 * The Judge Agent evaluates the research for gaps, bias, and accuracy.
 */
export const runJudgeAgent = async (topic: string, researchData: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a critical academic judge and fact-checker.
      
      Review the following research brief on the topic "${topic}".
      Identify any missing critical topics, logical inconsistencies, or areas that need more depth for a complete course.
      Provide specific instructions on how to improve the content for a course syllabus.
      
      Research Brief:
      ${researchData}`,
      config: {
        thinkingConfig: { thinkingBudget: 512 }, // Quick thinking for critique
      }
    });

    return response.text || "No critique provided.";
  } catch (error) {
    console.error("Judge Agent Error:", error);
    throw new Error("Judge agent failed to evaluate the research.");
  }
};

/**
 * The Writer Agent compiles everything into a structured course.
 */
export const runWriterAgent = async (topic: string, researchData: string, critique: string): Promise<CourseContent> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a best-selling course creator and educational writer.
      
      Create a comprehensive course structure for the topic "${topic}".
      Use the provided Research Brief and incorporate the Judge's Feedback to ensure high quality.
      
      Research Brief:
      ${researchData}
      
      Judge's Feedback:
      ${critique}
      
      Return the result as a strictly formatted JSON object matching the following schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            introduction: { type: Type.STRING },
            summary: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keyPoints: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'description', 'keyPoints']
              }
            }
          },
          required: ['title', 'introduction', 'modules', 'summary']
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Writer produced no output");
    
    return JSON.parse(jsonText) as CourseContent;
  } catch (error) {
    console.error("Writer Agent Error:", error);
    throw new Error("Writer agent failed to create the course.");
  }
};
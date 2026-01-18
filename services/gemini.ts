import { GoogleGenAI, Type } from "@google/genai";
import { CourseContent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * The Researcher Agent uses Google Search to find up-to-date information.
 * It can now accept previous research and feedback to refine its output.
 */
export const runResearcherAgent = async (
  topic: string, 
  previousResearch: string | null = null, 
  feedback: string | null = null
): Promise<{ text: string; sources: any[] }> => {
  try {
    let prompt = `You are an expert academic researcher. 
    Your task is to gather comprehensive, accurate, and structured information about the topic: "${topic}".
    Focus on finding key concepts, historical context, current state of the art, and fundamental principles.
    
    Format the output as a detailed research brief.`;

    if (previousResearch && feedback) {
      prompt = `You are an expert academic researcher.
      
      You previously conducted research on the topic: "${topic}".
      However, a Quality Judge has reviewed your findings and provided the following critique:
      "${feedback}"
      
      Your task is to REFINE and EXPAND the previous research.
      1. Address the Judge's feedback specifically.
      2. Keep the accurate parts of the previous research.
      3. Search for missing information.
      
      Previous Research Draft:
      ${previousResearch}
      
      Output a NEW, improved, and comprehensive research brief.`;
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 1024 }, // Enable thinking for better research planning
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
 * The Judge Agent evaluates the research.
 * Now returns a structured object indicating approval status and feedback.
 */
export const runJudgeAgent = async (topic: string, researchData: string): Promise<{ isApproved: boolean; feedback: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are a critical academic judge and fact-checker.
      
      Review the following research brief on the topic "${topic}".
      
      Your Goal: Ensure the content is sufficient to build a high-quality educational course.
      
      Criteria for Approval:
      1. Is the information accurate and relevant?
      2. Are there any hallucinations or obvious errors?
      3. Is the breadth and depth sufficient for a course?
      
      If the research is good enough, approve it.
      If it has major gaps or errors, reject it and provide specific feedback for the researcher.
      
      Research Brief:
      ${researchData}`,
      config: {
        thinkingConfig: { thinkingBudget: 512 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isApproved: { 
              type: Type.BOOLEAN,
              description: "Set to true if the research is good enough for a course. Set to false if major revisions are needed." 
            },
            feedback: { 
              type: Type.STRING,
              description: "If rejected, provide specific instructions on what to fix. If approved, provide a brief positive comment." 
            }
          },
          required: ['isApproved', 'feedback']
        }
      }
    });

    const text = response.text;
    if (!text) return { isApproved: true, feedback: "No output from judge, assuming approval." };
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Judge Agent Error:", error);
    // Fallback to approved to prevent getting stuck if API fails
    return { isApproved: true, feedback: "Judge unavailable, proceeding." };
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
      Use the provided Research Brief to generate the course content.
      
      Research Brief:
      ${researchData}
      
      Judge's Final Comments:
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

import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const refineTaskDescription = async (title: string, currentDescription: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Refine this task into a clear, actionable, professional description.\nTitle: ${title}\nContext: ${currentDescription}` }] }],
      config: {
        systemInstruction: "You are an expert productivity coach. Keep descriptions concise and under 100 words.",
      }
    });
    return response.text || currentDescription;
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentDescription;
  }
};

export const decomposeTask = async (title: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Break down this task into 3-5 logical, actionable sub-tasks.\nTask: ${title}\nDetails: ${description}` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              isDone: { type: Type.BOOLEAN }
            },
            required: ["title", "isDone"]
          }
        }
      }
    });
    const subTasks = JSON.parse(response.text || '[]');
    return subTasks.map((st: any) => ({ ...st, id: 'st-' + Math.random().toString(36).substr(2, 9) }));
  } catch (error) {
    console.error("Decomposition Error:", error);
    return [];
  }
};

export const generateDailyBriefingAudio = async (tasks: any[]) => {
  try {
    const activeTasks = tasks.filter(t => t.status !== 'DONE');
    const taskSummary = activeTasks.length > 0 
      ? activeTasks.map(t => `${t.title} (${t.priority} priority)`).join(", ")
      : "no urgent tasks at the moment. It's a great time to reflect or start something new.";
    
    const prompt = `Speak in a calm, encouraging professional voice: "Good day! Here is your Zentask briefing. Today you have ${activeTasks.length} active tasks. ${activeTasks.length > 0 ? 'Your focus items are: ' + taskSummary : taskSummary} Take a deep breath, and let's find your flow."`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Briefing API Error:", error);
    return null;
  }
};

export const suggestCategoryAndPriority = async (title: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: `Analyze this task and suggest a category and priority level.\nTitle: ${title}\nDescription: ${description}` }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { 
              type: Type.STRING,
              description: "Must be one of: LOW, MEDIUM, HIGH"
            }
          },
          required: ["category", "priority"]
        }
      }
    });
    return JSON.parse(response.text || '{"category": "General", "priority": "MEDIUM"}');
  } catch (error) {
    console.error("Suggestion Error:", error);
    return { category: "General", priority: "MEDIUM" };
  }
};

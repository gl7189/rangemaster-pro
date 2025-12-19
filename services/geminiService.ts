
import { GoogleGenAI, Type } from "@google/genai";

export interface TargetAnalysisResult {
  aCount: number;
  cCount: number;
  dCount: number;
  missCount: number;
  confidence: number;
  summary: string;
}

export const analyzeTargetImage = async (base64Image: string): Promise<TargetAnalysisResult> => {
  // Inicjalizacja instancji tuż przed użyciem, aby zapewnić dostęp do aktualnego process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Analyze this IPSC shooting target. Count the bullet holes in each zone: A (Alpha), C (Charlie), and D (Delta). Also identify any misses (M). Return the result in JSON format.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aCount: { type: Type.INTEGER },
          cCount: { type: Type.INTEGER },
          dCount: { type: Type.INTEGER },
          missCount: { type: Type.INTEGER },
          confidence: { type: Type.NUMBER },
          summary: { type: Type.STRING },
        },
        required: ["aCount", "cCount", "dCount", "missCount", "confidence", "summary"],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}') as TargetAnalysisResult;
  } catch (error) {
    console.error("Failed to parse AI response", error);
    throw new Error("Target analysis failed");
  }
};

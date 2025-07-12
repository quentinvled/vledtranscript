import { GoogleGenAI } from "@google/genai";
import { Language, SummaryType } from "../types";
import { PROMPTS } from "../constants";

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string } }> => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
        } else {
            reject(new Error("La lecture du fichier a échoué."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};

export const transcribeAudio = async (audioFile: File, language: Language, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("La clé API Gemini n'est pas fournie.");
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const audioPart = await fileToGenerativePart(audioFile);
        const languageInstruction = language === 'auto' 
            ? 'Détecte automatiquement la langue et transcris le contenu audio.' 
            : `La langue de l'audio est ${language}. Transcris le contenu.`;
        
        const textPart = { text: `Tâche : Transcription Audio. Instruction : ${languageInstruction}. La sortie doit être uniquement le texte transcrit, sans aucun formatage ou commentaire supplémentaire.` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Erreur lors de la transcription avec l'API Gemini :", error);
        throw new Error("L'appel à l'API Gemini a échoué. Cela peut être dû à une clé API invalide, des quotas dépassés, ou un problème de réseau. Consultez la console pour les détails techniques.");
    }
};

export const generateSummary = async (transcript: string, summaryType: SummaryType, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("La clé API Gemini n'est pas fournie.");
    if (!transcript) {
        return "Le texte à résumer est vide.";
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `${PROMPTS[summaryType]}\n\nTranscription à résumer:\n\n---\n${transcript}\n---`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Erreur lors de la génération du résumé avec l'API Gemini :", error);
        throw new Error("L'appel à l'API Gemini a échoué. Cela peut être dû à une clé API invalide, des quotas dépassés, ou un problème de réseau. Consultez la console pour les détails techniques.");
    }
};

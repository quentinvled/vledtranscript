import { GoogleGenAI } from "@google/genai";
import { Language, SummaryType } from "../types";
import { PROMPTS } from "../constants";

let ai: GoogleGenAI | null = null;

export const initializeAI = (apiKey: string): void => {
    try {
        ai = new GoogleGenAI({ apiKey });
    } catch (error) {
        console.error("Échec de l'initialisation de GoogleGenAI:", error);
        ai = null;
        throw new Error("Impossible d'initialiser le client AI. La clé API est peut-être malformée.");
    }
};

export const isAIInitialized = (): boolean => !!ai;

const getAIClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("Le client AI n'est pas initialisé. Veuillez fournir une clé API valide.");
    }
    return ai;
};

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

export const transcribeAudio = async (audioFile: File, language: Language): Promise<string> => {
    try {
        const client = getAIClient();
        const audioPart = await fileToGenerativePart(audioFile);
        const languageInstruction = language === 'auto' 
            ? 'Détecte automatiquement la langue et transcris le contenu audio.' 
            : `La langue de l'audio est ${language}. Transcris le contenu.`;
        
        const textPart = { text: `Tâche : Transcription Audio. Instruction : ${languageInstruction}. La sortie doit être uniquement le texte transcrit, sans aucun formatage ou commentaire supplémentaire.` };

        const response = await client.models.generateContent({
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

export const generateSummary = async (transcript: string, summaryType: SummaryType): Promise<string> => {
    if (!transcript) {
        return "Le texte à résumer est vide.";
    }
    
    try {
        const client = getAIClient();
        const prompt = `${PROMPTS[summaryType]}\n\nTranscription à résumer:\n\n---\n${transcript}\n---`;
        
        const response = await client.models.generateContent({
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
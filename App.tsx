import React, { useState, useCallback, useEffect } from 'react';
import { AppSettings, TranscriptionResult, SummaryResult } from './types';
import { transcribeAudio, generateSummary, initializeAI, isAIInitialized } from './services/geminiService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import ApiKeyModal from './components/ApiKeyModal';

export default function App(): React.ReactNode {
  const [settings, setSettings] = useState<AppSettings>({
    language: 'auto',
    summary_types: ['brief'],
    concurrent_files: 3,
    viewMode: 'separate',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [transcriptions, setTranscriptions] = useState<Record<string, TranscriptionResult>>({});
  const [summaries, setSummaries] = useState<Record<string, SummaryResult>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<{ value: number, text: string }>({ value: 0, text: '' });
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  const handleSetApiKey = useCallback((newKey: string) => {
    if (!newKey.trim()) {
        alert("La clé API ne peut pas être vide.");
        return;
    }
    try {
      initializeAI(newKey);
      setApiKey(newKey);
      sessionStorage.setItem('gemini-api-key', newKey);
      setShowApiKeyModal(false);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
      setApiKey(null);
      sessionStorage.removeItem('gemini-api-key');
    }
  }, []);
  
  useEffect(() => {
    const storedKey = sessionStorage.getItem('gemini-api-key');
    if (storedKey) {
      console.log("Clé API trouvée dans la session.");
      handleSetApiKey(storedKey);
      return;
    }

    const envKey = process.env.API_KEY;
    if (envKey) {
        console.log("Clé API trouvée dans les variables d'environnement.");
        handleSetApiKey(envKey);
        return;
    }
    
    console.log("Aucune clé API trouvée, ouverture du modal.");
    setShowApiKeyModal(true);
  }, [handleSetApiKey]);

  const handleSettingsChange = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setTranscriptions({});
    setSummaries({});
    setErrors({});
  }, []);

  const processFile = async (file: File, onProgress: (fileName: string) => void): Promise<void> => {
    try {
      onProgress(`Transcription de ${file.name}...`);
      const transcriptText = await transcribeAudio(file, settings.language);
      const newTranscription: TranscriptionResult = {
        text: transcriptText,
        words: transcriptText.split(/\s+/).length,
        characters: transcriptText.length,
      };
      setTranscriptions(prev => ({ ...prev, [file.name]: newTranscription }));

      if (settings.summary_types.length > 0) {
        const fileSummaries: SummaryResult = {};
        for (const type of settings.summary_types) {
          onProgress(`Résumé (${type}) pour ${file.name}...`);
          const summaryText = await generateSummary(transcriptText, type);
          fileSummaries[type] = summaryText;
        }
        setSummaries(prev => ({ ...prev, [file.name]: fileSummaries }));
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Une erreur inconnue est survenue.';
      console.error(`Erreur lors du traitement de ${file.name}:`, e);
      setErrors(prev => ({ ...prev, [file.name]: errorMessage }));
    }
  };

  const handleProcessFiles = useCallback(async () => {
    if (files.length === 0) return;
    if (!isAIInitialized()) {
        alert("Veuillez configurer votre clé API avant de lancer le traitement.");
        setShowApiKeyModal(true);
        return;
    }

    setIsProcessing(true);
    setTranscriptions({});
    setSummaries({});
    setErrors({});
    setProgress({ value: 0, text: 'Initialisation...' });

    const totalSteps = files.length * (1 + settings.summary_types.length);
    let completedSteps = 0;

    const updateGlobalProgress = (text: string) => {
      completedSteps++;
      const percent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      setProgress({ value: percent, text });
    };

    const filesToProcess = [...files];
    const concurrency = settings.concurrent_files;
    
    const promises = filesToProcess.map(file => async () => {
      try {
        await processFile(file, (taskText) => {
          updateGlobalProgress(taskText);
        });
      } catch (e) {
        // Errors are handled inside processFile
      }
    });

    const executePromisesInBatches = async <T,>(promiseFns: (() => Promise<T>)[], batchSize: number) => {
        for (let i = 0; i < promiseFns.length; i += batchSize) {
            const batch = promiseFns.slice(i, i + batchSize).map(fn => fn());
            await Promise.allSettled(batch);
        }
    };
    
    await executePromisesInBatches(promises, concurrency);

    setProgress({ value: 100, text: 'Traitement terminé !' });
    setIsProcessing(false);
  }, [files, settings, apiKey]);
  
  const handleRegenerateSummary = useCallback(async (fileName: string, transcript: string) => {
      if (!transcript) return;
       if (!isAIInitialized()) {
        alert("Veuillez configurer votre clé API avant de régénérer un résumé.");
        setShowApiKeyModal(true);
        return;
    }

      setIsProcessing(true);
      setProgress({ value: 0, text: `Régénération des résumés pour ${fileName}...` });
       try {
        const fileSummaries: SummaryResult = {};
        const summaryTypes = settings.summary_types;
        for (let i = 0; i < summaryTypes.length; i++) {
            const type = summaryTypes[i];
            setProgress({ value: (i / summaryTypes.length) * 100, text: `Génération du résumé ${type}...` });
            const summaryText = await generateSummary(transcript, type);
            fileSummaries[type] = summaryText;
        }
        setSummaries(prev => ({ ...prev, [fileName]: fileSummaries }));
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Une erreur inconnue est survenue.';
        setErrors(prev => ({ ...prev, [fileName + '_summary']: errorMessage }));
      } finally {
        setIsProcessing(false);
        setProgress({ value: 100, text: 'Régénération terminée.' });
      }
  }, [settings.summary_types, apiKey]);

  return (
    <>
      <ApiKeyModal isOpen={showApiKeyModal} onSetApiKey={handleSetApiKey} />
      <div className="min-h-screen flex flex-col">
        <Header onShowApiKeyModal={() => setShowApiKeyModal(true)} />
        <div className="flex-grow flex flex-col md:flex-row container mx-auto p-4 gap-6">
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <Sidebar settings={settings} onSettingsChange={handleSettingsChange} />
          </aside>
          <main className="w-full md:w-3/4 lg:w-4/5 flex flex-col gap-6">
            <FileUpload
              onFilesChange={handleFilesChange}
              onProcess={handleProcessFiles}
              isProcessing={isProcessing}
              files={files}
              progress={progress}
              isReady={isAIInitialized()}
            />
            <ResultsDisplay
              transcriptions={transcriptions}
              summaries={summaries}
              errors={errors}
              isProcessing={isProcessing}
              viewMode={settings.viewMode}
              summaryTypes={settings.summary_types}
              onRegenerateSummary={handleRegenerateSummary}
            />
          </main>
        </div>
      </div>
    </>
  );
}
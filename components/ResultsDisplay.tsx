
import React, { useState, useEffect } from 'react';
import { TranscriptionResult, SummaryResult, SummaryType } from '../types';
import { SUMMARY_OPTIONS } from '../constants';
import Loader from './Loader';

interface ResultsDisplayProps {
  transcriptions: Record<string, TranscriptionResult>;
  summaries: Record<string, SummaryResult>;
  errors: Record<string, string>;
  isProcessing: boolean;
  viewMode: 'separate' | 'merged';
  summaryTypes: SummaryType[];
  onRegenerateSummary: (fileName: string, transcript: string) => Promise<void>;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

const RefreshCwIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M3 21v-5h5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path></svg>
);


const EditableArea: React.FC<{ initialValue: string, onValueChange: (value: string) => void, height?: string, isProcessing: boolean }> = ({ initialValue, onValueChange, height = '300px', isProcessing }) => {
    const [value, setValue] = useState(initialValue);
    
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        onValueChange(e.target.value);
    }

    return (
        <textarea
            value={value}
            onChange={handleChange}
            className="w-full p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
            style={{ height }}
            disabled={isProcessing}
        />
    );
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ transcriptions, summaries, errors, isProcessing, viewMode, summaryTypes, onRegenerateSummary }) => {
  const [activeTab, setActiveTab] = useState(0);
  const fileNames = Object.keys(transcriptions);
  const [editedTranscripts, setEditedTranscripts] = useState<Record<string, string>>({});
  const [editedSummaries, setEditedSummaries] = useState<Record<string, SummaryResult>>({});


  useEffect(() => {
    if (fileNames.length > 0 && activeTab >= fileNames.length) {
      setActiveTab(0);
    }
    
    const initialTranscripts: Record<string, string> = {};
    for(const name of fileNames) {
        initialTranscripts[name] = transcriptions[name].text;
    }
    setEditedTranscripts(initialTranscripts);
    setEditedSummaries(summaries);

  }, [fileNames, activeTab, transcriptions, summaries]);

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadZip = async () => {
    const zip = new (window as any).JSZip();
    for (const filename in editedTranscripts) {
        const baseName = filename.substring(0, filename.lastIndexOf('.'));
        zip.file(`transcriptions/${baseName}.txt`, editedTranscripts[filename]);
    }
    for (const filename in editedSummaries) {
        const baseName = filename.substring(0, filename.lastIndexOf('.'));
        for(const summaryType in editedSummaries[filename]) {
             zip.file(`resumes/${baseName}_${summaryType}.txt`, editedSummaries[filename][summaryType as SummaryType]);
        }
    }
    
    const content = await zip.generateAsync({ type: "blob" });
    handleDownload(content, `export_complet_${new Date().toISOString()}.zip`);
  };

  if (Object.keys(transcriptions).length === 0 && !isProcessing && Object.keys(errors).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
        <p>Les résultats de la transcription apparaîtront ici.</p>
      </div>
    );
  }

  if (Object.keys(errors).length > 0) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erreurs rencontrées</h2>
            <div className="space-y-2">
            {Object.entries(errors).map(([filename, error]) => (
                <div key={filename} className="bg-red-50 p-3 rounded-md border border-red-200">
                    <p className="font-semibold text-red-800">{filename}</p>
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ))}
            </div>
        </div>
    );
  }

  const renderSingleFileResult = (fileName: string, index: number) => {
    const transcript = transcriptions[fileName];
    const fileSummaries = summaries[fileName] || {};
    const editedTranscript = editedTranscripts[fileName] || transcript.text;

    return (
        <div key={fileName} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Transcription</h3>
                <EditableArea 
                    initialValue={transcript.text} 
                    onValueChange={(value) => setEditedTranscripts(prev => ({...prev, [fileName]: value}))} 
                    isProcessing={isProcessing}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <div>
                        <span>Mots: {transcript.words}</span> | <span>Caractères: {transcript.characters}</span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleDownload(editedTranscript, `${fileName}_transcription.txt`)} className="flex items-center text-sm text-brand-primary hover:underline"><DownloadIcon /> Télécharger</button>
                       <button onClick={() => onRegenerateSummary(fileName, editedTranscript)} disabled={isProcessing} className="flex items-center text-sm text-brand-primary hover:underline disabled:opacity-50"><RefreshCwIcon /> Régénérer les résumés</button>
                    </div>
                </div>
            </div>

            {summaryTypes.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Résumés</h3>
                     {isProcessing && !summaries[fileName] ? <div className="flex items-center gap-2 text-gray-500"><Loader/> Génération en cours...</div> : null}
                    {Object.keys(fileSummaries).length > 0 ? (
                        <div className="border rounded-lg p-4 space-y-4">
                            {summaryTypes.map(type => fileSummaries[type] && (
                                <div key={type}>
                                    <h4 className="font-semibold text-gray-700">{SUMMARY_OPTIONS.find(o => o.value === type)?.label}</h4>
                                    <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{fileSummaries[type]}</p>
                                    <button onClick={() => handleDownload(fileSummaries[type] || '', `${fileName}_${type}.txt`)} className="flex items-center text-sm text-brand-primary hover:underline mt-1"><DownloadIcon /> Télécharger ce résumé</button>
                                </div>
                            ))}
                        </div>
                    ) : !isProcessing && <p className="text-gray-500">Aucun résumé généré.</p>}
                </div>
            )}
        </div>
    );
  }
  
  const renderMergedResult = () => {
    const mergedTranscript = fileNames.map(name => `--- FICHIER: ${name} ---\n\n${transcriptions[name].text}`).join('\n\n');
    const editedMerged = editedTranscripts['merged'] || mergedTranscript;

    return (
        <div className="space-y-6">
            <div>
                 <h3 className="text-lg font-semibold mb-2">Transcription Fusionnée</h3>
                 <EditableArea initialValue={mergedTranscript} onValueChange={(value) => setEditedTranscripts(prev => ({...prev, merged: value}))} height="400px" isProcessing={isProcessing} />
                 <div className="flex justify-end mt-2">
                    <button onClick={() => handleDownload(editedMerged, 'transcription_fusionnee.txt')} className="flex items-center text-sm text-brand-primary hover:underline"><DownloadIcon /> Télécharger</button>
                 </div>
            </div>
             {summaryTypes.length > 0 && (
                <div>
                     <h3 className="text-lg font-semibold mb-2">Résumé de la Fusion</h3>
                     <button onClick={() => onRegenerateSummary('merged', editedMerged)} disabled={isProcessing} className="mb-2 flex items-center text-sm text-white bg-brand-primary hover:bg-brand-secondary px-3 py-1 rounded disabled:opacity-50"><RefreshCwIcon /> Générer le résumé global</button>
                      {summaries['merged'] && (
                         <div className="border rounded-lg p-4 space-y-4">
                            {summaryTypes.map(type => summaries['merged']?.[type] && (
                                <div key={type}>
                                    <h4 className="font-semibold text-gray-700">{SUMMARY_OPTIONS.find(o => o.value === type)?.label}</h4>
                                    <p className="mt-1 text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{summaries['merged']?.[type]}</p>
                                    <button onClick={() => handleDownload(summaries['merged']?.[type] || '', `resume_fusionne_${type}.txt`)} className="flex items-center text-sm text-brand-primary hover:underline mt-1"><DownloadIcon /> Télécharger ce résumé</button>
                                </div>
                            ))}
                        </div>
                      )}
                </div>
             )}
        </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Résultats</h2>
        <button onClick={handleDownloadZip} className="flex items-center text-sm bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md font-semibold"><DownloadIcon /> Tout télécharger (.zip)</button>
      </div>
      
      {viewMode === 'separate' ? (
        <>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                {fileNames.map((name, index) => (
                    <button
                    key={name}
                    onClick={() => setActiveTab(index)}
                    className={`${
                        index === activeTab
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                    >
                    {name}
                    </button>
                ))}
                </nav>
            </div>
            <div className="pt-6">
                {fileNames[activeTab] && renderSingleFileResult(fileNames[activeTab], activeTab)}
            </div>
        </>
      ) : (
        <div className="pt-6">
            {renderMergedResult()}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
import React, { useCallback, useState } from 'react';
import AudioRecorder from './AudioRecorder';
import Loader from './Loader';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  onProcess: () => void;
  isProcessing: boolean;
  files: File[];
  progress: { value: number, text: string };
  isReady: boolean;
}

const FileIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-gray-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
);


const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, onProcess, isProcessing, files, progress, isReady }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesChange(Array.from(e.target.files));
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesChange(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [onFilesChange]);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e);
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      handleDragEvents(e);
      setIsDragging(false);
  };
  
  const handleRecordingComplete = (audioFile: File) => {
      onFilesChange([...files, audioFile]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-brand-primary bg-indigo-50' : 'border-gray-300'}`}
        onDrop={handleDrop}
        onDragOver={handleDragEvents}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="audio/*,video/*"
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-400 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <p className="text-gray-600">
            Glissez-déposez vos fichiers ici ou <span className="font-semibold text-brand-primary">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Fichiers audio ou vidéo supportés</p>
        </label>
      </div>

      <div className="flex items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
          <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      <AudioRecorder onRecordingComplete={handleRecordingComplete} />

      {files.length > 0 && (
        <div className="space-y-3 pt-4">
            <h3 className="font-semibold text-lg">Fichiers à traiter ({files.length})</h3>
            <ul className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <div className="flex items-center gap-3">
                            <FileIcon />
                            <span className="text-sm font-medium text-gray-800">{file.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </li>
                ))}
            </ul>
        </div>
      )}

      {files.length > 0 && (
        <div className="pt-4">
          <button
            onClick={onProcess}
            disabled={isProcessing || !isReady}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? <Loader /> : '🚀'}
            <span>{isProcessing ? 'Traitement en cours...' : `TRANSCRIRE ${files.length} FICHIER(S)`}</span>
          </button>
          {isProcessing && (
              <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress.value}%`, transition: 'width 0.5s ease' }}></div>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2 truncate">{progress.text}</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
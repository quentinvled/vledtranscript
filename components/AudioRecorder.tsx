
import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioFile: File) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, []);
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // This will trigger 'onstop'
      setIsRecording(false);
    }
  };

  const handleStartRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsRecording(true);
      audioChunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `enregistrement-${new Date().toISOString()}.webm`, { type: 'audio/webm' });
        onRecordingComplete(audioFile);
        cleanup();
      };
      
      mediaRecorderRef.current.start();

    } catch (err) {
      console.error("Erreur d'accès au microphone:", err);
      alert("Impossible d'accéder au microphone. Veuillez vérifier les permissions de votre navigateur.");
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-brand-secondary"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            <div>
                <p className="font-semibold text-gray-800">Enregistrer un audio</p>
                <p className="text-sm text-gray-500">
                  Utilisez votre microphone pour une transcription directe.
                </p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`px-4 py-2 rounded-md font-semibold text-white transition-colors flex items-center gap-2 w-32 justify-center ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-primary hover:bg-brand-secondary'}`}
            >
                {isRecording ? (
                    <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Arrêter
                    </>
                ) : (
                    'Démarrer'
                )}
            </button>
        </div>
    </div>
  );
};

export default AudioRecorder;
import React from 'react';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
}

const KeyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="m21.73 18.27-5.4-5.4C17.22 11.69 18 9.95 18 8A6 6 0 0 0 6 8c0 1.95.78 3.69 1.67 4.87l-5.4 5.4a1 1 0 0 0 0 1.41l2.83 2.83a1 1 0 0 0 1.41 0l5.4-5.4a4.004 4.004 0 0 0 5.66 0l5.4 5.4a1 1 0 0 0 1.41 0l2.83-2.83a1 1 0 0 0 0-1.41z"></path><circle cx="8" cy="8" r="2"></circle></svg>
);


const Header: React.FC<HeaderProps> = ({ onOpenApiKeyModal }) => {
  return (
    <header className="w-full shadow-md bg-gradient-to-r from-brand-primary to-brand-secondary">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            🎤 Vled Audio Transcriptor
          </h1>
          <p className="text-sm text-gray-200 mt-1">
            Transcription et résumé audio par IA • Interface optimisée • Export automatique
          </p>
        </div>
        <button
          onClick={onOpenApiKeyModal}
          className="flex-shrink-0 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center"
          aria-label="Changer la clé API"
        >
          <KeyIcon />
          <span>Clé API</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

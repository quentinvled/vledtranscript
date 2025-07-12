import React from 'react';

const KeyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="m21.73 18.27-5.4-5.4C17.52 11.23 18 9.44 18 7.5A5.5 5.5 0 0 0 7.5 2a5.5 5.5 0 0 0-5.46 6.57L2.27 12.3a1.5 1.5 0 0 0 0 2.12l5.4 5.4a1.5 1.5 0 0 0 2.12 0l2.12-2.12 2.12 2.12a1.5 1.5 0 0 0 2.12 0l4.24-4.24a1.5 1.5 0 0 0 0-2.12z"></path><line x1="16" y1="8" x2="16" y2="8"></line></svg>
);

interface HeaderProps {
    onShowApiKeyModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowApiKeyModal }) => {
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
        <div>
            <button
                onClick={onShowApiKeyModal}
                className="flex items-center bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                aria-label="Changer la clé API"
            >
                <KeyIcon />
                Clé API
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
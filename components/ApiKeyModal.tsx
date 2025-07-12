import React, { useState } from 'react';

interface ApiKeyModalProps {
    isOpen: boolean;
    onSetApiKey: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSetApiKey }) => {
    const [key, setKey] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (key.trim()) {
            onSetApiKey(key);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full transform transition-all" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <h2 id="modal-title" className="text-2xl font-bold mb-4 text-brand-dark">Clé API Gemini Requise</h2>
                <p className="text-gray-600 mb-4">
                    Pour utiliser l'application, veuillez fournir votre propre clé API Google Gemini. Votre clé est stockée de manière sécurisée dans votre navigateur et n'est jamais partagée.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="api-key-input" className="sr-only">Clé API Gemini</label>
                        <input
                            id="api-key-input"
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Entrez votre clé API Gemini"
                            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            aria-label="Clé API Gemini"
                            autoComplete="off"
                        />
                    </div>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-primary hover:underline mt-2 inline-block"
                    >
                        🔗 Obtenir une clé API gratuite sur Google AI Studio
                    </a>
                    <button
                        type="submit"
                        disabled={!key.trim()}
                        className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enregistrer et Démarrer
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyModal;
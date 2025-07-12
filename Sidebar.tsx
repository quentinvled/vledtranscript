
import React from 'react';
import { AppSettings, SummaryType } from '../types';
import { SUPPORTED_LANGUAGES, SUMMARY_OPTIONS } from '../constants';

interface SidebarProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
}

const SettingsCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">{title}</h3>
    {children}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ settings, onSettingsChange }) => {
  const handleSummaryChange = (summaryType: SummaryType) => {
    const newSummaryTypes = settings.summary_types.includes(summaryType)
      ? settings.summary_types.filter(st => st !== summaryType)
      : [...settings.summary_types, summaryType];
    onSettingsChange({ summary_types: newSummaryTypes });
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="⚙️ Paramètres">
        <div className="space-y-4">
          <div>
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-600 mb-1">🌍 Langue</label>
            <select
              id="language-select"
              value={settings.language}
              onChange={(e) => onSettingsChange({ language: e.target.value as AppSettings['language'] })}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-600 mb-2">👁️ Vue des résultats</label>
             <div className="flex rounded-md shadow-sm">
                <button
                    type="button"
                    onClick={() => onSettingsChange({ viewMode: 'separate' })}
                    className={`flex-1 px-4 py-2 text-sm font-medium ${settings.viewMode === 'separate' ? 'bg-brand-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-md border border-gray-300 focus:z-10 focus:ring-2 focus:ring-brand-primary`}
                >
                    Séparée
                </button>
                <button
                    type="button"
                    onClick={() => onSettingsChange({ viewMode: 'merged' })}
                    className={`-ml-px flex-1 px-4 py-2 text-sm font-medium ${settings.viewMode === 'merged' ? 'bg-brand-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-md border border-gray-300 focus:z-10 focus:ring-2 focus:ring-brand-primary`}
                >
                    Fusionnée
                </button>
             </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="📝 Résumés Automatiques">
        <div className="space-y-2">
          {SUMMARY_OPTIONS.map(opt => (
            <label key={opt.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.summary_types.includes(opt.value)}
                onChange={() => handleSummaryChange(opt.value)}
                className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              />
              <span className="text-sm text-gray-700">{opt.icon} {opt.label}</span>
            </label>
          ))}
        </div>
      </SettingsCard>
      
      <SettingsCard title="🔧 Options Avancées">
         <div>
            <label htmlFor="concurrent-files" className="block text-sm font-medium text-gray-600">Fichiers simultanés: <span className="font-bold text-brand-primary">{settings.concurrent_files}</span></label>
            <input
              id="concurrent-files"
              type="range"
              min="1"
              max="5"
              value={settings.concurrent_files}
              onChange={(e) => onSettingsChange({ concurrent_files: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary mt-2"
            />
          </div>
      </SettingsCard>
    </div>
  );
};

export default Sidebar;


export type Language = 'auto' | 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko';

export type SummaryType = 'brief' | 'points' | 'complete';

export interface AppSettings {
  language: Language;
  summary_types: SummaryType[];
  concurrent_files: number;
  viewMode: 'separate' | 'merged';
}

export interface TranscriptionResult {
  text: string;
  words: number;
  characters: number;
}

export type SummaryResult = {
  [key in SummaryType]?: string;
};

export interface LanguageOption {
  value: Language;
  label: string;
  flag: string;
}

export interface SummaryOption {
  value: SummaryType;
  label: string;
  icon: string;
}

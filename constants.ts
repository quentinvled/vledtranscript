
import { LanguageOption, SummaryOption, SummaryType } from './types';

export const PROMPTS: Record<SummaryType, string> = {
  brief: `Fais un résumé très bref de cette transcription en 2-3 phrases maximum. Va à l'essentiel et capture l'idée principale. La réponse doit être uniquement le résumé.`,
  points: `Fais un résumé de cette transcription sous forme de points clés bien structurés. Utilise des puces et organise les informations de manière claire et hiérarchique. Mets en avant les éléments les plus importants. La réponse doit être uniquement le résumé.`,
  complete: `Fais un bilan complet et bien organisé de cette transcription. Structure ton analyse avec :
- Un résumé général
- Les points principaux développés
- Les détails importants
- Une conclusion/synthèse
Sois précis, organisé et complet dans ton analyse. La réponse doit être uniquement le résumé.`
};

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: 'auto', label: 'Auto-détection', flag: '🔍' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'Anglais', flag: '🇺🇸' },
  { value: 'es', label: 'Espagnol', flag: '🇪🇸' },
  { value: 'de', label: 'Allemand', flag: '🇩🇪' },
  { value: 'it', label: 'Italien', flag: '🇮🇹' },
  { value: 'pt', label: 'Portugais', flag: '🇵🇹' },
  { value: 'ru', label: 'Russe', flag: '🇷🇺' },
  { value: 'ja', label: 'Japonais', flag: '🇯🇵' },
  { value: 'ko', label: 'Coréen', flag: '🇰🇷' }
];

export const SUMMARY_OPTIONS: SummaryOption[] = [
  { value: 'brief', label: 'Résumé bref', icon: '📄' },
  { value: 'points', label: 'Points clés', icon: '🔹' },
  { value: 'complete', label: 'Analyse complète', icon: '📋' }
];

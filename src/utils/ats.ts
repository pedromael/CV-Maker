import type { CVData } from '../types/cv';
import { GLOBAL_TECH_KEYWORDS } from '../data/techKeywords';

const STOP_WORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'na', 'nas', 'no', 'nos',
  'o', 'os', 'ou', 'para', 'por', 'um', 'uma', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with'
]);

const splitTokens = (value: string) =>
  (value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9+#]+(?:[./-][a-z0-9+#]+)*/g) ?? [])
    .map((item) => item.trim())
    .filter((item) => item.length > 1 && !STOP_WORDS.has(item));

const normalizeKeywordPhrase = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#./\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const addNormalizedKeyword = (keywords: Set<string>, value: string) => {
  const normalized = normalizeKeywordPhrase(value);
  if (normalized.length > 1) keywords.add(normalized);
};

export const generateATSKeywords = (cvData: CVData, includeTechKeywords: boolean = true): string => {
  const tokenEntries = [
    cvData.professionalSummary,
    ...cvData.experiences.map((exp) => `${exp.role} ${exp.description}`),
    ...cvData.projects.map((project) => `${project.technologies} ${project.description}`),
    ...cvData.certifications.map((cert) => cert.name)
  ];

  const keywords = new Set(tokenEntries.flatMap(splitTokens));

  addNormalizedKeyword(keywords, cvData.personalInfo.professionalTitle);
  cvData.skills.languages.forEach((item) => addNormalizedKeyword(keywords, item));
  cvData.skills.frameworks.forEach((item) => addNormalizedKeyword(keywords, item));
  cvData.skills.tools.forEach((item) => addNormalizedKeyword(keywords, item));
  cvData.skills.softSkills.forEach((item) => addNormalizedKeyword(keywords, item));
  cvData.certifications.forEach((cert) => addNormalizedKeyword(keywords, cert.name));

  if (includeTechKeywords) {
    GLOBAL_TECH_KEYWORDS.forEach((keyword) => {
      addNormalizedKeyword(keywords, keyword);
    });
  }

  return Array.from(keywords).join(', ');
};

import type { CVData } from '../types/cv';

const splitTokens = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((item) => item.trim())
    .filter((item) => item.length > 1);

export const generateATSKeywords = (cvData: CVData): string => {
  const entries = [
    cvData.personalInfo.professionalTitle,
    cvData.professionalSummary,
    ...cvData.skills.languages,
    ...cvData.skills.frameworks,
    ...cvData.skills.tools,
    ...cvData.skills.softSkills,
    ...cvData.experiences.map((exp) => `${exp.role} ${exp.description}`),
    ...cvData.projects.map((project) => `${project.technologies} ${project.description}`),
    ...cvData.certifications.map((cert) => cert.name)
  ];

  const keywords = new Set(entries.flatMap(splitTokens));

  return Array.from(keywords).join(' ');
};

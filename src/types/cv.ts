export type SkillCategory = 'languages' | 'frameworks' | 'tools' | 'softSkills';

export interface FormatSettings {
  fontSize: number;      // base font size in pt (default: 11)
  lineHeight: number;    // line-height ratio (default: 1.39)
  sectionGap: number;    // gap before section title in mm (default: 4)
  entryGap: number;      // gap between entries in mm (default: 2)
  marginX: number;       // horizontal margin in mm (default: 14)
  marginY: number;       // vertical margin in mm (default: 16)
}

export const defaultFormatSettings: FormatSettings = {
  fontSize: 11,
  lineHeight: 1.39,
  sectionGap: 4,
  entryGap: 2,
  marginX: 14,
  marginY: 16,
};

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
  photo: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  course: string;
  startDate: string;
  endDate: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  link: string;
}

export interface Certification {
  name: string;
  organization: string;
  year: string;
}

export interface Skills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skills;
  languages: Language[];
  projects: Project[];
  certifications: Certification[];
}

export const initialCVData: CVData = {
  personalInfo: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    location: '',
    photo: ''
  },
  professionalSummary: '',
  experiences: [
    {
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    }
  ],
  education: [
    {
      institution: '',
      course: '',
      startDate: '',
      endDate: ''
    }
  ],
  skills: {
    languages: [],
    frameworks: [],
    tools: [],
    softSkills: []
  },
  languages: [
    {
      name: '',
      level: ''
    }
  ],
  projects: [
    {
      name: '',
      description: '',
      technologies: '',
      link: ''
    }
  ],
  certifications: [
    {
      name: '',
      organization: '',
      year: ''
    }
  ]
};

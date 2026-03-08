export type SkillCategory = 'languages' | 'frameworks' | 'tools' | 'softSkills';

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  location: string;
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
    location: ''
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

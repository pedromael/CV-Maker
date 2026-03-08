import type { SkillCategory } from '../types/cv';

const normalize = (value: string) => value.toLowerCase().trim();

const contains = (value: string, targets: string[]) => {
  const normalized = normalize(value);
  return targets.some((target) => normalized.includes(target));
};

export const getSummarySuggestions = (title: string): string[] => {
  if (!title) return [];

  if (contains(title, ['frontend', 'front-end', 'react'])) {
    return [
      'Desenvolvedor Front-end com foco em interfaces acessíveis, performáticas e escaláveis para aplicações web modernas.',
      'Experiência em construção de produtos digitais orientados a usabilidade, com forte colaboração entre design e engenharia.',
      'Atuação em desenvolvimento de componentes reutilizáveis, otimização de performance e boas práticas de qualidade de código.'
    ];
  }

  if (contains(title, ['backend', 'back-end', 'node', 'python'])) {
    return [
      'Desenvolvedor Back-end com experiência em APIs REST, arquitetura de serviços e integração com bancos de dados relacionais e não relacionais.',
      'Foco em criação de soluções robustas, escaláveis e seguras com monitoramento, testes e boas práticas de engenharia.',
      'Atuação em desenho de sistemas, automação de processos e melhoria contínua de desempenho em ambientes de produção.'
    ];
  }

  if (contains(title, ['full stack', 'fullstack'])) {
    return [
      'Desenvolvedor Full-stack com experiência em ponta a ponta, da modelagem de dados ao desenvolvimento de interfaces orientadas ao usuário.',
      'Capacidade de traduzir necessidades de negócio em soluções web escaláveis, com foco em performance e experiência do usuário.',
      'Vivência em times ágeis, integração contínua e entrega incremental de funcionalidades de alto impacto.'
    ];
  }

  return [
    'Profissional orientado a resultados, com experiência em desenvolvimento de soluções digitais alinhadas a objetivos de negócio.',
    'Atuação colaborativa em ambientes ágeis, com foco em qualidade, melhoria contínua e entrega de valor.',
    'Comprometido com boas práticas, organização técnica e evolução constante de processos e produtos.'
  ];
};

export const getExperienceSuggestions = (title: string): string[] => {
  if (!title) return [];

  if (contains(title, ['frontend', 'front-end', 'react'])) {
    return [
      'Desenvolvi interfaces responsivas e acessíveis com React, melhorando a experiência do usuário e reduzindo retrabalho do time de suporte.',
      'Implementei componentes reutilizáveis e padronizados, acelerando o ciclo de entrega e aumentando a consistência visual do produto.',
      'Otimizei performance de páginas críticas, reduzindo tempo de carregamento e melhorando métricas de conversão.'
    ];
  }

  if (contains(title, ['backend', 'back-end', 'node', 'python'])) {
    return [
      'Desenhei e implementei APIs REST escaláveis para integração entre sistemas internos e externos.',
      'Refatorei fluxos de processamento e consultas, reduzindo tempo de resposta e custos de infraestrutura.',
      'Implementei monitoramento, logs estruturados e tratamento de falhas para elevar a confiabilidade do sistema.'
    ];
  }

  return [
    'Conduzi melhorias técnicas e funcionais com foco em eficiência operacional e qualidade da entrega.',
    'Colaborei com times multidisciplinares para identificar prioridades e transformar requisitos em soluções práticas.',
    'Documentei processos e padrões técnicos para facilitar manutenção e evolução contínua da plataforma.'
  ];
};

const catalog: Record<SkillCategory, string[]> = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'],
  frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Django'],
  tools: ['Git', 'Docker', 'Linux', 'Postman', 'CI/CD'],
  softSkills: ['Comunicação', 'Colaboração', 'Resolução de problemas', 'Liderança', 'Gestão de tempo']
};

const professionBoost: Record<string, Partial<Record<SkillCategory, string[]>>> = {
  frontend: {
    languages: ['JavaScript', 'TypeScript'],
    frameworks: ['React', 'Next.js'],
    tools: ['Git', 'CI/CD'],
    softSkills: ['Comunicação', 'Colaboração']
  },
  backend: {
    languages: ['Python', 'Java', 'SQL'],
    frameworks: ['Node.js', 'Express', 'Django'],
    tools: ['Docker', 'Linux', 'Git'],
    softSkills: ['Resolução de problemas', 'Gestão de tempo']
  },
  'full stack': {
    languages: ['JavaScript', 'TypeScript', 'SQL'],
    frameworks: ['React', 'Node.js', 'Next.js'],
    tools: ['Git', 'Docker', 'CI/CD'],
    softSkills: ['Comunicação', 'Colaboração', 'Resolução de problemas']
  }
};

export const getSkillSuggestions = (title: string, category: SkillCategory): string[] => {
  const normalized = normalize(title);
  let result = [...catalog[category]];

  Object.entries(professionBoost).forEach(([key, boost]) => {
    if (normalized.includes(key)) {
      result = [...new Set([...(boost[category] ?? []), ...result])];
    }
  });

  return result;
};

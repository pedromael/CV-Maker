import { useMemo, useRef, useState } from 'react';
import { SectionCard } from './components/SectionCard';
import { getExperienceSuggestions, getSkillSuggestions, getSummarySuggestions } from './data/suggestions';
import { generateATSKeywords } from './utils/ats';
import { exportToDOCX, exportToJSON, exportToPDF } from './utils/exporters';
import type {
  CVData,
  Certification,
  Education,
  Experience,
  Language,
  Project,
  SkillCategory
} from './types/cv';
import { initialCVData } from './types/cv';

const categoryLabels: Record<SkillCategory, string> = {
  languages: 'Linguagens',
  frameworks: 'Frameworks',
  tools: 'Ferramentas',
  softSkills: 'Soft skills'
};

const levels = ['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'];

function App() {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const previewRef = useRef<HTMLDivElement>(null);

  const summarySuggestions = useMemo(
    () => getSummarySuggestions(cvData.personalInfo.professionalTitle),
    [cvData.personalInfo.professionalTitle]
  );

  const experienceSuggestions = useMemo(
    () => getExperienceSuggestions(cvData.personalInfo.professionalTitle),
    [cvData.personalInfo.professionalTitle]
  );

  const atsKeywords = useMemo(() => generateATSKeywords(cvData), [cvData]);

  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      updatePersonalInfo('photo', result);
    };
    reader.readAsDataURL(file);
  };

  const updatePersonalInfo = (field: keyof CVData['personalInfo'], value: string) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const updateListItem = <T,>(section: keyof CVData, index: number, nextValue: T) => {
    setCvData((prev) => {
      const collection = prev[section] as T[];
      const updated = collection.map((item, itemIndex) => (itemIndex === index ? nextValue : item));
      return {
        ...prev,
        [section]: updated
      } as CVData;
    });
  };

  const addListItem = <T,>(section: keyof CVData, template: T) => {
    setCvData((prev) => ({
      ...prev,
      [section]: [...(prev[section] as T[]), template]
    }));
  };

  const removeListItem = (section: keyof CVData, index: number) => {
    setCvData((prev) => ({
      ...prev,
      [section]: (prev[section] as unknown[]).filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const toggleSkill = (category: SkillCategory, skill: string) => {
    setCvData((prev) => {
      const exists = prev.skills[category].includes(skill);
      return {
        ...prev,
        skills: {
          ...prev.skills,
          [category]: exists
            ? prev.skills[category].filter((item) => item !== skill)
            : [...prev.skills[category], skill]
        }
      };
    });
  };

  const safeList = <T,>(items: T[], isValid: (item: T) => boolean) => items.filter(isValid);

  const exportPDF = async () => {
    await exportToPDF(previewRef.current);
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-slate-50 px-4 py-6 lg:px-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CV Maker ATS</h1>
          <p className="text-sm text-slate-600">Crie um currículo profissional com alta compatibilidade ATS.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportPDF} className="btn-primary" type="button">
            Exportar PDF
          </button>
          <button onClick={() => exportToDOCX(cvData)} className="btn-secondary" type="button">
            Exportar DOCX
          </button>
          <button onClick={() => exportToJSON(cvData)} className="btn-secondary" type="button">
            Exportar JSON
          </button>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <SectionCard title="Foto">
            <div className="space-y-2">
              <input
                className="input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-slate-500">Upload opcional para exibir no preview do currículo.</p>
              {cvData.personalInfo.photo && (
                <button
                  type="button"
                  className="text-xs font-medium text-red-600"
                  onClick={() => updatePersonalInfo('photo', '')}
                >
                  Remover foto
                </button>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Dados pessoais">
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input" placeholder="Nome" value={cvData.personalInfo.fullName} onChange={(e) => updatePersonalInfo('fullName', e.target.value)} />
              <input className="input" placeholder="Título profissional" value={cvData.personalInfo.professionalTitle} onChange={(e) => updatePersonalInfo('professionalTitle', e.target.value)} />
              <input className="input" placeholder="Email" value={cvData.personalInfo.email} onChange={(e) => updatePersonalInfo('email', e.target.value)} />
              <input className="input" placeholder="Telefone" value={cvData.personalInfo.phone} onChange={(e) => updatePersonalInfo('phone', e.target.value)} />
              <input className="input" placeholder="LinkedIn" value={cvData.personalInfo.linkedin} onChange={(e) => updatePersonalInfo('linkedin', e.target.value)} />
              <input className="input" placeholder="GitHub" value={cvData.personalInfo.github} onChange={(e) => updatePersonalInfo('github', e.target.value)} />
              <input className="input md:col-span-2" placeholder="Cidade / País" value={cvData.personalInfo.location} onChange={(e) => updatePersonalInfo('location', e.target.value)} />
            </div>
          </SectionCard>

          <SectionCard title="Resumo profissional">
            <textarea
              className="input min-h-28"
              placeholder="Descreva seu resumo profissional"
              value={cvData.professionalSummary}
              onChange={(e) => setCvData((prev) => ({ ...prev, professionalSummary: e.target.value }))}
            />
            {summarySuggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Sugestões automáticas</p>
                {summarySuggestions.map((suggestion) => (
                  <button
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs text-slate-700 hover:bg-slate-100"
                    key={suggestion}
                    onClick={() => setCvData((prev) => ({ ...prev, professionalSummary: suggestion }))}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Experiência profissional"
            action={
              <button
                className="btn-secondary"
                type="button"
                onClick={() => addListItem<Experience>('experiences', { company: '', role: '', startDate: '', endDate: '', description: '' })}
              >
                + Adicionar
              </button>
            }
          >
            {cvData.experiences.map((experience, index) => (
              <div key={`${experience.company}-${index}`} className="space-y-2 rounded-lg border border-slate-200 p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <input className="input" placeholder="Empresa" value={experience.company} onChange={(e) => updateListItem<Experience>('experiences', index, { ...experience, company: e.target.value })} />
                  <input className="input" placeholder="Cargo" value={experience.role} onChange={(e) => updateListItem<Experience>('experiences', index, { ...experience, role: e.target.value })} />
                  <input className="input" placeholder="Data início" value={experience.startDate} onChange={(e) => updateListItem<Experience>('experiences', index, { ...experience, startDate: e.target.value })} />
                  <input className="input" placeholder="Data término" value={experience.endDate} onChange={(e) => updateListItem<Experience>('experiences', index, { ...experience, endDate: e.target.value })} />
                </div>
                <textarea className="input min-h-20" placeholder="Descrição da experiência" value={experience.description} onChange={(e) => updateListItem<Experience>('experiences', index, { ...experience, description: e.target.value })} />
                {experienceSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {experienceSuggestions.map((suggestion) => (
                      <button
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                        key={`${suggestion}-${index}`}
                        onClick={() => updateListItem<Experience>('experiences', index, { ...experience, description: suggestion })}
                        type="button"
                      >
                        Usar sugestão
                      </button>
                    ))}
                  </div>
                )}
                {cvData.experiences.length > 1 && (
                  <button className="text-xs font-medium text-red-600" onClick={() => removeListItem('experiences', index)} type="button">
                    Remover experiência
                  </button>
                )}
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Educação"
            action={
              <button className="btn-secondary" type="button" onClick={() => addListItem<Education>('education', { institution: '', course: '', startDate: '', endDate: '' })}>
                + Adicionar
              </button>
            }
          >
            {cvData.education.map((education, index) => (
              <div key={`${education.institution}-${index}`} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
                <input className="input" placeholder="Instituição" value={education.institution} onChange={(e) => updateListItem<Education>('education', index, { ...education, institution: e.target.value })} />
                <input className="input" placeholder="Curso" value={education.course} onChange={(e) => updateListItem<Education>('education', index, { ...education, course: e.target.value })} />
                <input className="input" placeholder="Data início" value={education.startDate} onChange={(e) => updateListItem<Education>('education', index, { ...education, startDate: e.target.value })} />
                <input className="input" placeholder="Data conclusão" value={education.endDate} onChange={(e) => updateListItem<Education>('education', index, { ...education, endDate: e.target.value })} />
                {cvData.education.length > 1 && (
                  <button className="text-xs font-medium text-red-600 md:col-span-2" onClick={() => removeListItem('education', index)} type="button">
                    Remover educação
                  </button>
                )}
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Skills">
            {(Object.keys(categoryLabels) as SkillCategory[]).map((category) => {
              const suggestions = getSkillSuggestions(cvData.personalInfo.professionalTitle, category);
              return (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700">{categoryLabels[category]}</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((skill) => {
                      const active = cvData.skills[category].includes(skill);
                      return (
                        <button
                          key={`${category}-${skill}`}
                          type="button"
                          onClick={() => toggleSkill(category, skill)}
                          className={`rounded-full border px-3 py-1 text-xs ${
                            active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </SectionCard>

          <SectionCard
            title="Idiomas"
            action={
              <button className="btn-secondary" type="button" onClick={() => addListItem<Language>('languages', { name: '', level: '' })}>
                + Adicionar
              </button>
            }
          >
            {cvData.languages.map((language, index) => (
              <div key={`${language.name}-${index}`} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-2">
                <input className="input" placeholder="Idioma" value={language.name} onChange={(e) => updateListItem<Language>('languages', index, { ...language, name: e.target.value })} />
                <select className="input" value={language.level} onChange={(e) => updateListItem<Language>('languages', index, { ...language, level: e.target.value })}>
                  <option value="">Nível</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {cvData.languages.length > 1 && (
                  <button className="text-xs font-medium text-red-600 md:col-span-2" onClick={() => removeListItem('languages', index)} type="button">
                    Remover idioma
                  </button>
                )}
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Projetos"
            action={
              <button className="btn-secondary" type="button" onClick={() => addListItem<Project>('projects', { name: '', description: '', technologies: '', link: '' })}>
                + Adicionar
              </button>
            }
          >
            {cvData.projects.map((project, index) => (
              <div key={`${project.name}-${index}`} className="space-y-2 rounded-lg border border-slate-200 p-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <input className="input" placeholder="Nome" value={project.name} onChange={(e) => updateListItem<Project>('projects', index, { ...project, name: e.target.value })} />
                  <input className="input" placeholder="Tecnologias" value={project.technologies} onChange={(e) => updateListItem<Project>('projects', index, { ...project, technologies: e.target.value })} />
                  <input className="input md:col-span-2" placeholder="Link" value={project.link} onChange={(e) => updateListItem<Project>('projects', index, { ...project, link: e.target.value })} />
                </div>
                <textarea className="input min-h-20" placeholder="Descrição" value={project.description} onChange={(e) => updateListItem<Project>('projects', index, { ...project, description: e.target.value })} />
                {cvData.projects.length > 1 && (
                  <button className="text-xs font-medium text-red-600" onClick={() => removeListItem('projects', index)} type="button">
                    Remover projeto
                  </button>
                )}
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Certificações"
            action={
              <button className="btn-secondary" type="button" onClick={() => addListItem<Certification>('certifications', { name: '', organization: '', year: '' })}>
                + Adicionar
              </button>
            }
          >
            {cvData.certifications.map((certification, index) => (
              <div key={`${certification.name}-${index}`} className="grid gap-2 rounded-lg border border-slate-200 p-3 md:grid-cols-3">
                <input className="input" placeholder="Nome" value={certification.name} onChange={(e) => updateListItem<Certification>('certifications', index, { ...certification, name: e.target.value })} />
                <input className="input" placeholder="Organização" value={certification.organization} onChange={(e) => updateListItem<Certification>('certifications', index, { ...certification, organization: e.target.value })} />
                <input className="input" placeholder="Ano" value={certification.year} onChange={(e) => updateListItem<Certification>('certifications', index, { ...certification, year: e.target.value })} />
                {cvData.certifications.length > 1 && (
                  <button className="text-xs font-medium text-red-600 md:col-span-3" onClick={() => removeListItem('certifications', index)} type="button">
                    Remover certificação
                  </button>
                )}
              </div>
            ))}
          </SectionCard>
        </section>

        <section>
          <div
            ref={previewRef}
            className="relative mx-auto min-h-[1123px] w-full max-w-[794px] rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm"
          >
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{cvData.personalInfo.fullName || 'Seu Nome'}</h2>
                <p className="mt-1 text-base font-medium text-slate-700">{cvData.personalInfo.professionalTitle || 'Título profissional'}</p>
                <p className="mt-3 text-xs text-slate-600">
                  {[cvData.personalInfo.email, cvData.personalInfo.phone, cvData.personalInfo.linkedin, cvData.personalInfo.github, cvData.personalInfo.location]
                    .filter(Boolean)
                    .join(' | ')}
                </p>
              </div>
              {cvData.personalInfo.photo && (
                <img
                  src={cvData.personalInfo.photo}
                  alt="Foto profissional"
                  className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
                />
              )}
            </header>

            <div className="space-y-5 pt-5 text-sm leading-relaxed">
              <article>
                <h3 className="section-title">Resumo</h3>
                <p>{cvData.professionalSummary || '-'}</p>
              </article>

              <article>
                <h3 className="section-title">Experiência</h3>
                {safeList(cvData.experiences, (item) => Boolean(item.company || item.role || item.description)).map((experience, index) => (
                  <div className="mb-3" key={`${experience.company}-${index}`}>
                    <p className="font-semibold">{experience.role || '-'} | {experience.company || '-'}</p>
                    <p className="text-xs text-slate-600">{experience.startDate || '-'} - {experience.endDate || 'Atual'}</p>
                    <p>{experience.description || '-'}</p>
                  </div>
                ))}
              </article>

              <article>
                <h3 className="section-title">Educação</h3>
                {safeList(cvData.education, (item) => Boolean(item.institution || item.course)).map((education, index) => (
                  <div className="mb-3" key={`${education.institution}-${index}`}>
                    <p className="font-semibold">{education.course || '-'} | {education.institution || '-'}</p>
                    <p className="text-xs text-slate-600">{education.startDate || '-'} - {education.endDate || '-'}</p>
                  </div>
                ))}
              </article>

              <article>
                <h3 className="section-title">Skills</h3>
                <p>
                  {[...cvData.skills.languages, ...cvData.skills.frameworks, ...cvData.skills.tools, ...cvData.skills.softSkills].join(' • ') || '-'}
                </p>
              </article>

              <article>
                <h3 className="section-title">Projetos</h3>
                {safeList(cvData.projects, (item) => Boolean(item.name || item.description)).map((project, index) => (
                  <div className="mb-3" key={`${project.name}-${index}`}>
                    <p className="font-semibold">{project.name || '-'}</p>
                    <p>{project.description || '-'}</p>
                    <p className="text-xs text-slate-600">{project.technologies || '-'}</p>
                    <p className="text-xs text-slate-600">{project.link || '-'}</p>
                  </div>
                ))}
              </article>

              <article>
                <h3 className="section-title">Certificações</h3>
                {safeList(cvData.certifications, (item) => Boolean(item.name || item.organization)).map((certification, index) => (
                  <p key={`${certification.name}-${index}`}>{certification.name || '-'} | {certification.organization || '-'} ({certification.year || '-'})</p>
                ))}
              </article>

              <article>
                <h3 className="section-title">Idiomas</h3>
                {safeList(cvData.languages, (item) => Boolean(item.name || item.level)).map((language, index) => (
                  <p key={`${language.name}-${index}`}>{language.name || '-'} | {language.level || '-'}</p>
                ))}
              </article>
            </div>

            <div className="ats-keywords" aria-hidden="true">
              {atsKeywords}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

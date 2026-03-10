import type { CVData, FormatSettings } from '../types/cv';
import { defaultFormatSettings } from '../types/cv';

export interface LayoutElement {
  type: 'text' | 'sectionTitle';
  text?: string;
  bold?: boolean;
  fontSize: number;       // in pt
  x: number;              // in mm
  y: number;              // in mm
  maxWidth: number;       // in mm
}

/**
 * Produces a flat list of positioned elements using the same algorithm as the PDF exporter.
 * Both the preview renderer and the PDF exporter consume this to guarantee visual parity.
 */
export function computeLayout(cvData: CVData, fmt: FormatSettings = defaultFormatSettings): LayoutElement[] {
  const pageWidth = 210; // A4 mm
  const marginX = fmt.marginX;
  const maxWidth = pageWidth - marginX * 2;
  const fontSizeMm = fmt.fontSize * 0.3528;
  const lineHeight = fontSizeMm * fmt.lineHeight;
  const topY = fmt.marginY;
  let y = topY;

  const elements: LayoutElement[] = [];

  // Rough char-per-line estimation for text wrapping (Helvetica avg char width ≈ 0.5 × fontSize in pt → mm)
  const estimateLines = (text: string, width: number, size: number): string[] => {
    const charWidthMm = size * 0.3528 * 0.5;
    const charsPerLine = Math.max(1, Math.floor(width / charWidthMm));
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (test.length > charsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length > 0 ? lines : [''];
  };

  const addText = (text: string, options?: { bold?: boolean; size?: number; gapAfter?: number; x?: number; maxW?: number }) => {
    const value = text.trim();
    if (!value) return;
    const size = options?.size ?? fmt.fontSize;
    const xPos = options?.x ?? marginX;
    const mw = options?.maxW ?? maxWidth;

    const lines = estimateLines(value, mw, size);
    lines.forEach((line) => {
      elements.push({
        type: 'text',
        text: line,
        bold: options?.bold ?? false,
        fontSize: size,
        x: xPos,
        y,
        maxWidth: mw,
      });
      y += lineHeight;
    });
    y += options?.gapAfter ?? 0;
  };

  const addSectionTitle = (title: string) => {
    y += fmt.sectionGap * 0.6;
    const size = Math.round(fmt.fontSize * 1.091);
    const value = title.toUpperCase();
    const lines = estimateLines(value, maxWidth, size);
    lines.forEach((line) => {
      elements.push({
        type: 'sectionTitle',
        text: line,
        bold: true,
        fontSize: size,
        x: marginX,
        y,
        maxWidth,
      });
      y += lineHeight;
    });
    y += fmt.sectionGap * 0.4;
  };

  const textOffsetX = marginX;
  const headerMaxWidth = maxWidth;

  // Name
  addText(cvData.personalInfo.fullName || 'Nome Completo', { bold: true, size: Math.round(fmt.fontSize * 1.636), gapAfter: 1, x: textOffsetX, maxW: headerMaxWidth });
  // Title
  addText(cvData.personalInfo.professionalTitle || 'Título profissional', { size: Math.round(fmt.fontSize * 1.091), gapAfter: 1, x: textOffsetX, maxW: headerMaxWidth });
  // Contact
  const contactText = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.linkedin,
    cvData.personalInfo.github,
    cvData.personalInfo.location,
  ].filter(Boolean).join(' | ');
  addText(contactText, { size: Math.round(fmt.fontSize * 0.909), gapAfter: 2, x: textOffsetX, maxW: headerMaxWidth });

  // --- Body ---
  const bodyIndent = 4;
  const bodyX = marginX + bodyIndent;
  const bodyMaxW = maxWidth - bodyIndent;

  addSectionTitle('Resumo');
  addText(cvData.professionalSummary || '-', { gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW });

  addSectionTitle('Experiência Profissional');
  cvData.experiences.forEach((exp) => {
    if (!exp.company && !exp.role && !exp.description) return;
    addText(`${exp.role || '-'} | ${exp.company || '-'}`, { bold: true, x: bodyX, maxW: bodyMaxW });
    addText(`${exp.startDate || '-'} - ${exp.endDate || 'Atual'}`, { size: Math.round(fmt.fontSize * 0.909), x: bodyX, maxW: bodyMaxW });
    addText(exp.description || '-', { gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW });
  });

  addSectionTitle('Formação Acadêmica');
  cvData.education.forEach((edu) => {
    if (!edu.institution && !edu.course) return;
    addText(`${edu.course || '-'} | ${edu.institution || '-'}`, { bold: true, x: bodyX, maxW: bodyMaxW });
    addText(`${edu.startDate || '-'} - ${edu.endDate || '-'}`, {
      size: Math.round(fmt.fontSize * 0.909),
      gapAfter: fmt.entryGap,
      x: bodyX,
      maxW: bodyMaxW,
    });
  });

  addSectionTitle('Skills');
  addText(
    [...cvData.skills.languages, ...cvData.skills.frameworks, ...cvData.skills.tools, ...cvData.skills.softSkills].join(' • ') || '-',
    { gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW }
  );

  addSectionTitle('Projetos');
  cvData.projects.forEach((project) => {
    if (!project.name && !project.description) return;
    addText(project.name || '-', { bold: true, x: bodyX, maxW: bodyMaxW });
    addText(project.description || '-', { x: bodyX, maxW: bodyMaxW });
    addText(`Tecnologias: ${project.technologies || '-'}`, { size: Math.round(fmt.fontSize * 0.909), x: bodyX, maxW: bodyMaxW });
    addText(project.link || '-', { size: Math.round(fmt.fontSize * 0.909), gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW });
  });

  addSectionTitle('Certificações');
  cvData.certifications.forEach((cert) => {
    if (!cert.name && !cert.organization) return;
    addText(`${cert.name || '-'} | ${cert.organization || '-'} (${cert.year || '-'})`, { gapAfter: fmt.entryGap * 0.5, x: bodyX, maxW: bodyMaxW });
  });

  addSectionTitle('Idiomas');
  cvData.languages.forEach((lang) => {
    if (!lang.name && !lang.level) return;
    addText(`${lang.name || '-'} | ${lang.level || '-'}`, { gapAfter: fmt.entryGap * 0.5, x: bodyX, maxW: bodyMaxW });
  });

  return elements;
}

import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { CVData } from '../types/cv';
import type { FormatSettings } from '../types/cv';
import { defaultFormatSettings } from '../types/cv';
import { generateATSKeywords } from './ats';

const getFileName = (cvData: CVData, extension: string): string => {
  const fullName = cvData.personalInfo.fullName || 'Curriculo';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const displayName = nameParts.length > 1 ? `${firstName}_${lastName}` : firstName;
  //const sanitized = sanitizeFileName(displayName);
  return `Curriculum_${displayName}.${extension}`;
};

const sectionTitle = (title: string) =>
  new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 24 })],
    spacing: { before: 240, after: 80 }
  });

export const exportToJSON = (cvData: CVData) => {
  const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' });
  saveAs(blob, getFileName(cvData, 'json'));
};

export const exportToPDF = async (cvData: CVData, fmt: FormatSettings = defaultFormatSettings) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = fmt.marginX;
  const topY = fmt.marginY;
  const bottomY = pageHeight - fmt.marginY;
  const maxWidth = pageWidth - marginX * 2;
  // Convert line-height ratio to mm: fontSize pt → mm, then multiply by ratio
  const fontSizeMm = fmt.fontSize * 0.3528;
  const lineHeight = fontSizeMm * fmt.lineHeight;
  let y = topY;

  const ensureSpace = (needed = lineHeight) => {
    if (y + needed > bottomY) {
      pdf.addPage();
      y = topY;
    }
  };

  const writeText = (text: string, options?: { bold?: boolean; size?: number; gapAfter?: number; x?: number; maxW?: number }) => {
    const value = text.trim();
    if (!value) return;

    pdf.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    pdf.setFontSize(options?.size ?? fmt.fontSize);

    const x = options?.x ?? marginX;
    const width = options?.maxW ?? maxWidth;
    const lines = pdf.splitTextToSize(value, width) as string[];
    lines.forEach((line) => {
      ensureSpace();
      pdf.text(line, x, y);
      y += lineHeight;
    });

    y += options?.gapAfter ?? 0;
  };

  const writeSectionTitle = (title: string) => {
    ensureSpace(10);
    y += fmt.sectionGap * 0.6;
    writeText(title.toUpperCase(), { bold: true, size: Math.round(fmt.fontSize * 1.091), gapAfter: fmt.sectionGap * 0.4 });
  };

  const textOffsetX = marginX;
  const headerMaxWidth = maxWidth;

  // Name
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(Math.round(fmt.fontSize * 1.636));
  const nameLines = pdf.splitTextToSize(cvData.personalInfo.fullName || 'Nome Completo', headerMaxWidth) as string[];
  nameLines.forEach((line) => { pdf.text(line, textOffsetX, y); y += lineHeight; });
  y += 1;

  // Title
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(Math.round(fmt.fontSize * 1.091));
  const titleLines = pdf.splitTextToSize(cvData.personalInfo.professionalTitle || 'Título profissional', headerMaxWidth) as string[];
  titleLines.forEach((line) => { pdf.text(line, textOffsetX, y); y += lineHeight; });
  y += 1;

  // Contact
  const contactText = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.linkedin,
    cvData.personalInfo.github,
    cvData.personalInfo.location
  ].filter(Boolean).join(' | ');
  pdf.setFontSize(Math.round(fmt.fontSize * 0.909));
  const contactLines = pdf.splitTextToSize(contactText, headerMaxWidth) as string[];
  contactLines.forEach((line) => { pdf.text(line, textOffsetX, y); y += lineHeight; });
  y += 2;

  const bodyIndent = 4;
  const bodyX = marginX + bodyIndent;
  const bodyMaxW = maxWidth - bodyIndent;

  writeSectionTitle('Resumo');
  writeText(cvData.professionalSummary || '-', { gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW });

  writeSectionTitle('Experiência');
  cvData.experiences.forEach((experience) => {
    if (!experience.company && !experience.role && !experience.description) return;
    writeText(`${experience.role || '-'} | ${experience.company || '-'}`, { bold: true, x: bodyX, maxW: bodyMaxW });
    writeText(`${experience.startDate || '-'} - ${experience.endDate || 'Atual'}`, { size: Math.round(fmt.fontSize * 0.909), x: bodyX, maxW: bodyMaxW });
    writeText(experience.description || '-', { gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW });
  });

  writeSectionTitle('Educação');
  cvData.education.forEach((education) => {
    if (!education.institution && !education.course) return;
    writeText(`${education.course || '-'} | ${education.institution || '-'}`, {
      bold: true,
      x: bodyX,
      maxW: bodyMaxW
    });
    writeText(`${education.startDate || '-'} - ${education.endDate || '-'}`, {
      size: Math.round(fmt.fontSize * 0.909),
      gapAfter: fmt.entryGap,
      x: bodyX,
      maxW: bodyMaxW
    });
  });

  writeSectionTitle('Skills');
  writeText(
    [
      ...cvData.skills.languages,
      ...cvData.skills.frameworks,
      ...cvData.skills.tools,
      ...cvData.skills.softSkills
    ].join(' • ') || '-',
    { gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW }
  );

  writeSectionTitle('Projetos');
  cvData.projects.forEach((project) => {
    if (!project.name && !project.description) return;
    writeText(project.name || '-', { bold: true, x: bodyX, maxW: bodyMaxW });
    writeText(project.description || '-', { x: bodyX, maxW: bodyMaxW });
    writeText(`Tecnologias: ${project.technologies || '-'}`, { size: Math.round(fmt.fontSize * 0.909), x: bodyX, maxW: bodyMaxW });
    writeText(project.link || '-', { size: Math.round(fmt.fontSize * 0.909), gapAfter: fmt.entryGap, x: bodyX, maxW: bodyMaxW });
  });

  writeSectionTitle('Certificações');
  cvData.certifications.forEach((certification) => {
    if (!certification.name && !certification.organization) return;
    writeText(`${certification.name || '-'} | ${certification.organization || '-'} (${certification.year || '-'})`, {
      gapAfter: fmt.entryGap * 0.5,
      x: bodyX,
      maxW: bodyMaxW
    });
  });

  writeSectionTitle('Idiomas');
  cvData.languages.forEach((language) => {
    if (!language.name && !language.level) return;
    writeText(`${language.name || '-'} | ${language.level || '-'}`, { gapAfter: fmt.entryGap * 0.5, x: bodyX, maxW: bodyMaxW });
  });

  // Adicionar tokens ATS de forma invisível
  const atsKeywords = generateATSKeywords(cvData);
  pdf.setFontSize(1);
  pdf.setTextColor(255, 255, 255);
  pdf.text(atsKeywords, marginX, bottomY - 0.5, { maxWidth: maxWidth, lineHeightFactor: 0.5 });
  pdf.setTextColor(0, 0, 0);

  pdf.save(getFileName(cvData, 'pdf'));
};

export const exportToDOCX = async (cvData: CVData) => {
  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: cvData.personalInfo.fullName || 'Nome Completo', bold: true, size: 32 })
            ]
          }),
          new Paragraph({
            children: [new TextRun({ text: cvData.personalInfo.professionalTitle, size: 24 })],
            spacing: { after: 120 }
          }),
          new Paragraph({
            text: [
              cvData.personalInfo.email,
              cvData.personalInfo.phone,
              cvData.personalInfo.linkedin,
              cvData.personalInfo.github,
              cvData.personalInfo.location
            ]
              .filter(Boolean)
              .join(' | ')
          }),
          sectionTitle('Resumo Profissional'),
          new Paragraph({ text: cvData.professionalSummary || '-' }),
          sectionTitle('Experiência'),
          ...cvData.experiences.flatMap((exp) => [
            new Paragraph({
              children: [new TextRun({ text: `${exp.role || '-'} - ${exp.company || '-'}`, bold: true })]
            }),
            new Paragraph({ text: `${exp.startDate || '-'} - ${exp.endDate || 'Atual'}` }),
            new Paragraph({ text: exp.description || '-' })
          ]),
          sectionTitle('Educação'),
          ...cvData.education.flatMap((edu) => [
            new Paragraph({
              children: [new TextRun({ text: `${edu.course || '-'} - ${edu.institution || '-'}`, bold: true })]
            }),
            new Paragraph({ text: `${edu.startDate || '-'} - ${edu.endDate || '-'}` })
          ]),
          sectionTitle('Skills'),
          new Paragraph({
            text: [
              ...cvData.skills.languages,
              ...cvData.skills.frameworks,
              ...cvData.skills.tools,
              ...cvData.skills.softSkills
            ].join(', ')
          }),
          sectionTitle('Projetos'),
          ...cvData.projects.flatMap((project) => [
            new Paragraph({ children: [new TextRun({ text: project.name || '-', bold: true })] }),
            new Paragraph({ text: project.description || '-' }),
            new Paragraph({ text: `Tecnologias: ${project.technologies || '-'}` }),
            new Paragraph({ text: project.link || '-' })
          ]),
          sectionTitle('Certificações'),
          ...cvData.certifications.map(
            (cert) => new Paragraph({ text: `${cert.name || '-'} - ${cert.organization || '-'} (${cert.year || '-'})` })
          ),
          sectionTitle('Idiomas'),
          ...cvData.languages.map((language) => new Paragraph({ text: `${language.name || '-'} - ${language.level || '-'}` })),
          new Paragraph({
            children: [new TextRun({ text: generateATSKeywords(cvData), color: 'FFFFFF', size: 2 })]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, getFileName(cvData, 'docx'));
};

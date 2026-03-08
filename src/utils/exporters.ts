import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import type { CVData } from '../types/cv';

const sectionTitle = (title: string) =>
  new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 24 })],
    spacing: { before: 240, after: 80 }
  });

export const exportToJSON = (cvData: CVData) => {
  const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' });
  saveAs(blob, 'curriculo.json');
};

export const exportToPDF = async (cvData: CVData) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 14;
  const topY = 16;
  const bottomY = pageHeight - 14;
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 5.4;
  let y = topY;

  const ensureSpace = (needed = lineHeight) => {
    if (y + needed > bottomY) {
      pdf.addPage();
      y = topY;
    }
  };

  const writeText = (text: string, options?: { bold?: boolean; size?: number; gapAfter?: number }) => {
    const value = text.trim();
    if (!value) return;

    pdf.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    pdf.setFontSize(options?.size ?? 11);

    const lines = pdf.splitTextToSize(value, maxWidth) as string[];
    lines.forEach((line) => {
      ensureSpace();
      pdf.text(line, marginX, y);
      y += lineHeight;
    });

    y += options?.gapAfter ?? 0;
  };

  const writeSectionTitle = (title: string) => {
    ensureSpace(10);
    y += 1;
    writeText(title.toUpperCase(), { bold: true, size: 12, gapAfter: 1.5 });
  };

  writeText(cvData.personalInfo.fullName || 'Nome Completo', { bold: true, size: 18, gapAfter: 1 });
  writeText(cvData.personalInfo.professionalTitle || 'Título profissional', { size: 12, gapAfter: 1 });
  writeText(
    [
      cvData.personalInfo.email,
      cvData.personalInfo.phone,
      cvData.personalInfo.linkedin,
      cvData.personalInfo.github,
      cvData.personalInfo.location
    ]
      .filter(Boolean)
      .join(' | '),
    { size: 10, gapAfter: 2 }
  );

  writeSectionTitle('Resumo');
  writeText(cvData.professionalSummary || '-', { gapAfter: 2 });

  writeSectionTitle('Experiência');
  cvData.experiences.forEach((experience) => {
    if (!experience.company && !experience.role && !experience.description) return;
    writeText(`${experience.role || '-'} | ${experience.company || '-'}`, { bold: true });
    writeText(`${experience.startDate || '-'} - ${experience.endDate || 'Atual'}`, { size: 10 });
    writeText(experience.description || '-', { gapAfter: 1.5 });
  });

  writeSectionTitle('Educação');
  cvData.education.forEach((education) => {
    if (!education.institution && !education.course) return;
    writeText(`${education.course || '-'} | ${education.institution || '-'}`, { bold: true });
    writeText(`${education.startDate || '-'} - ${education.endDate || '-'}`, { size: 10, gapAfter: 1.5 });
  });

  writeSectionTitle('Skills');
  writeText(
    [
      ...cvData.skills.languages,
      ...cvData.skills.frameworks,
      ...cvData.skills.tools,
      ...cvData.skills.softSkills
    ].join(' • ') || '-',
    { gapAfter: 2 }
  );

  writeSectionTitle('Projetos');
  cvData.projects.forEach((project) => {
    if (!project.name && !project.description) return;
    writeText(project.name || '-', { bold: true });
    writeText(project.description || '-');
    writeText(`Tecnologias: ${project.technologies || '-'}`, { size: 10 });
    writeText(project.link || '-', { size: 10, gapAfter: 1.5 });
  });

  writeSectionTitle('Certificações');
  cvData.certifications.forEach((certification) => {
    if (!certification.name && !certification.organization) return;
    writeText(`${certification.name || '-'} | ${certification.organization || '-'} (${certification.year || '-'})`, {
      gapAfter: 1
    });
  });

  writeSectionTitle('Idiomas');
  cvData.languages.forEach((language) => {
    if (!language.name && !language.level) return;
    writeText(`${language.name || '-'} | ${language.level || '-'}`, { gapAfter: 1 });
  });

  pdf.save('curriculo.pdf');
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
          ...cvData.languages.map((language) => new Paragraph({ text: `${language.name || '-'} - ${language.level || '-'}` }))
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(document);
  saveAs(blob, 'curriculo.docx');
};

import html2canvas from 'html2canvas';
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

export const exportToPDF = async (previewElement: HTMLElement | null) => {
  if (!previewElement) return;

  const canvas = await html2canvas(previewElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
  const imageWidth = canvas.width * ratio;
  const imageHeight = canvas.height * ratio;

  pdf.addImage(imageData, 'PNG', (pageWidth - imageWidth) / 2, 10, imageWidth, imageHeight);
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

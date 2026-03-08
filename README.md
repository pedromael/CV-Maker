# CV Maker ATS

Sistema web para geração automática de currículos profissionais com preview em tempo real e foco em compatibilidade com ATS.

## Arquitetura do sistema

- **Frontend**: React + TypeScript + TailwindCSS
- **Estado local**: `useState` centralizado em `App.tsx`
- **Camada de domínio**:
  - Tipos do currículo em `src/types/cv.ts`
  - Sugestões inteligentes em `src/data/suggestions.ts`
  - Geração de palavras-chave ATS em `src/utils/ats.ts`
  - Exportadores em `src/utils/exporters.ts`
- **Template único**: preview minimalista no lado direito da tela, otimizado para leitura ATS

## Estrutura de pastas

```txt
CV-Maker/
  src/
    components/
      SectionCard.tsx
    data/
      suggestions.ts
    types/
      cv.ts
    utils/
      ats.ts
      exporters.ts
    App.tsx
    main.tsx
    index.css
  index.html
  package.json
  tailwind.config.ts
  postcss.config.cjs
  vite.config.ts
```

## Componentes principais

- `App.tsx`
  - Formulário por seções
  - Campos repetíveis (experiência, educação, idiomas, projetos, certificações)
  - Preview automático em tempo real
  - Ações de exportação
- `SectionCard.tsx`
  - Bloco visual reutilizável para cada seção do formulário
- Utilitários ATS e exportação
  - Keywords invisíveis para ATS
  - Exportação em PDF, DOCX e JSON

## Lógica de geração do currículo

1. Usuário preenche formulários simples por seção.
2. Estado central é atualizado instantaneamente.
3. Preview renderiza automaticamente:
   - Header com nome e título
   - Resumo
   - Experiência
   - Educação
   - Skills
   - Projetos
   - Certificações
   - Idiomas
4. Sistema gera palavras-chave ATS com base em:
   - profissão
   - skills
   - experiências
   - tecnologias
5. Keywords são inseridas no rodapé como texto invisível.

## Exemplo de template HTML do currículo

Trecho do template usado no preview (`src/App.tsx`):

```html
<div class="resume-preview">
  <header>
    <h2>Nome</h2>
    <p>Título profissional</p>
  </header>

  <article>
    <h3>Resumo</h3>
    <p>Resumo profissional...</p>
  </article>

  <article>
    <h3>Experiência</h3>
    <p>Cargo | Empresa</p>
  </article>
</div>
```

## Exemplo de palavras-chave invisíveis ATS

HTML:

```html
<div class="ats-keywords">
  python javascript react node docker rest api microservices git linux agile scrum
</div>
```

CSS:

```css
.ats-keywords {
  position: absolute;
  bottom: 0;
  font-size: 2px;
  color: white;
  opacity: 0.01;
}
```

## Lógica inteligente implementada

- Sugestões de resumo com base no título profissional.
- Sugestões de descrição de experiência por perfil.
- Sugestões de skills por categoria e profissão.
- Geração automática de keywords para ATS.

## Como executar

```bash
npm install
npm run dev
```

## Exportações

- `PDF`: captura do template em A4
- `DOCX`: geração estruturada por seções
- `JSON`: dump completo dos dados do currículo

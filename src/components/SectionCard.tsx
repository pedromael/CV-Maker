import { useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

interface SectionCardProps extends PropsWithChildren {
  title: string;
  action?: ReactNode;
  defaultOpen?: boolean;
}

export function SectionCard({ title, action, children, defaultOpen = false }: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          <button
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Fechar seção ${title}` : `Abrir seção ${title}`}
            title={isOpen ? 'Fechar seção' : 'Abrir seção'}
          >
            <span aria-hidden="true">{isOpen ? '▾' : '▸'}</span>
          </button>
        </div>
      </div>
      {isOpen && <div className="space-y-3">{children}</div>}
    </section>
  );
}

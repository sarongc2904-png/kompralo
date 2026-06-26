'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { EditableElement, EditableElementId } from '@/domain/visual-editor';
import { updateInlineEditableText } from '@/app/dashboard/invitations/[id]/edit/actions';
import { VisualEditorBottomSheet } from './VisualEditorBottomSheet';

type EditableZone = {
  id: EditableElementId;
  title: string;
  description: string;
  targetId: string;
  className: string;
};

const EDITABLE_ZONES: Record<EditableElementId, EditableZone> = {
  hero: {
    id: 'hero',
    title: 'Portada',
    description: 'Foto principal, frase de portada, video y mÃºsica de fondo.',
    targetId: 'visual-editor-media',
    className: 'left-[8%] right-[8%] top-[7%] h-[21%]',
  },
  event: {
    id: 'event',
    title: 'Datos del evento',
    description: 'Nombre, fecha, hora y detalles principales del evento.',
    targetId: 'visual-editor-event',
    className: 'left-[10%] right-[10%] top-[31%] h-[15%]',
  },
  location: {
    id: 'location',
    title: 'UbicaciÃ³n',
    description: 'Lugar, direcciÃ³n y enlaces de navegaciÃ³n para tus invitados.',
    targetId: 'visual-editor-location',
    className: 'left-[10%] right-[10%] top-[58%] h-[15%]',
  },
  gallery: {
    id: 'gallery',
    title: 'GalerÃ­a',
    description: 'Fotos y recuerdos que se muestran en la invitaciÃ³n.',
    targetId: 'visual-editor-gallery',
    className: 'left-[10%] right-[10%] top-[75%] h-[10%]',
  },
  music: {
    id: 'music',
    title: 'MÃºsica',
    description: 'CanciÃ³n o audio de fondo para la experiencia de la invitaciÃ³n.',
    targetId: 'visual-editor-media',
    className: 'left-[68%] right-[8%] top-[7%] h-[8%]',
  },
};

interface VisualEditorMobileEntryProps {
  invitationId: string;
  slug?: string | null;
  editableElements: EditableElement[];
  children: ReactNode;
}

export function VisualEditorMobileEntry({
  invitationId,
  slug,
  editableElements,
  children,
}: VisualEditorMobileEntryProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<EditableElement | null>(null);
  const [highlightedId, setHighlightedId] = useState<EditableElementId | null>(null);
  const [inlineSaveStatus, setInlineSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [previewHeight, setPreviewHeight] = useState(680);
  const [showHint, setShowHint] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewUrl = `/preview/${invitationId}?from=editor&editorPreview=1&skipIntro=1`;
  const publicPreviewUrl = slug ? `/i/${slug}` : `/preview/${invitationId}`;

  const visibleElements = useMemo(
    () => editableElements.filter((element) => element.editable && EDITABLE_ZONES[element.id]),
    [editableElements],
  );

  const selectedZone = selectedElement ? EDITABLE_ZONES[selectedElement.id] : null;

  useEffect(() => {
    let savedTimer: number | null = null;

    async function handleInlineEdit(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; fieldPath?: string; value?: string };
      if (data?.type !== 'KOMPRALO_INLINE_EDIT' || !data.fieldPath || typeof data.value !== 'string') return;

      setInlineSaveStatus('saving');
      const result = await updateInlineEditableText({
        id: invitationId,
        fieldPath: data.fieldPath,
        value: data.value,
      });

      setInlineSaveStatus(result.success ? 'saved' : 'error');
      if (savedTimer) window.clearTimeout(savedTimer);
      savedTimer = window.setTimeout(() => setInlineSaveStatus('idle'), 1800);
    }

    window.addEventListener('message', handleInlineEdit);
    return () => {
      window.removeEventListener('message', handleInlineEdit);
      if (savedTimer) window.clearTimeout(savedTimer);
    };
  }, [invitationId]);

  useEffect(() => {
    function handlePreviewResize(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; height?: number };
      if (data?.type !== 'KOMPRALO_PREVIEW_HEIGHT' || typeof data.height !== 'number') return;
      setPreviewHeight(Math.max(680, Math.min(data.height, 12000)));
    }

    window.addEventListener('message', handlePreviewResize);
    return () => window.removeEventListener('message', handlePreviewResize);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(false), 5200);
    return () => window.clearTimeout(timer);
  }, []);

  function scrollToPreview() {
    window.setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function scrollToElement(element: EditableElement | null) {
    if (!element) return;

    const targetId = EDITABLE_ZONES[element.id].targetId;
    window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 120);
  }

  function handleZoneTouch(element: EditableElement) {
    setHighlightedId(element.id);
    setSelectedElement(element);
  }

  function handleEditSelected() {
    setAdvancedOpen(true);
    scrollToElement(selectedElement);
  }

  function handleCloseForm() {
    setAdvancedOpen(false);
    setSelectedElement(null);
    setHighlightedId(null);
    scrollToPreview();
  }

  return (
    <>
      <div className="md:hidden" ref={previewRef}>
        <section className="relative -mx-4 mb-6 min-h-[calc(100dvh-92px)] overflow-hidden bg-[#F6F0E4] px-3 pb-4 pt-0">
          <div
            className="pointer-events-none sticky top-0 z-30 -mx-3 border-b border-[#E6D8BD] bg-[#F6F0E4]/95 px-3 pb-3 pt-3 shadow-sm backdrop-blur"
            style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
          >
            <div className="mx-auto flex max-w-[430px] items-center justify-between gap-3">
              <a
                href="/cliente"
                className="pointer-events-auto rounded-full border border-[#E6D8BD] bg-[#FFFDF8] px-4 py-2 text-xs font-bold text-[#5F4B35] shadow-sm"
              >
                ← Regresar
              </a>
              <a
                href={publicPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto rounded-full border border-[#E6D8BD] bg-[#FFFDF8] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8A6D3B] shadow-sm"
              >
                Vista previa
              </a>
            </div>
            {showHint && (
              <div className="pointer-events-none mx-auto mt-3 max-w-[430px] rounded-2xl border border-[#E6D8BD] bg-[#FFFDF8]/95 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8A6D3B] shadow-sm">
                Estás editando tu invitación. Toca un texto para modificarlo.
              </div>
            )}
            {inlineSaveStatus !== 'idle' && (
              <div className="pointer-events-none mx-auto mt-2 max-w-[430px] text-right">
                <span className="inline-flex rounded-full border border-[#E6D8BD] bg-[#FFFDF8]/95 px-3 py-1 text-[11px] font-semibold text-[#6E573A] shadow-sm">
                  {inlineSaveStatus === 'saving' && 'Guardando…'}
                  {inlineSaveStatus === 'saved' && 'Guardado'}
                  {inlineSaveStatus === 'error' && 'No se pudo guardar'}
                </span>
              </div>
            )}
          </div>

          <div
            className="relative mx-auto mt-4 h-[calc(100dvh-190px)] max-h-[760px] min-h-[560px] max-w-[430px] overflow-y-auto overscroll-contain rounded-[32px] border border-[#E6D8BD] bg-[#FFFDF8] shadow-2xl"
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
          >
            <iframe
              src={previewUrl}
              title="Vista previa de la invitaciÃ³n"
              className="relative z-0 block w-full border-0 pointer-events-auto"
              style={{ height: previewHeight }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              scrolling="yes"
            />

            <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
              {visibleElements.map((element) => {
                const zone = EDITABLE_ZONES[element.id];
                const isHighlighted = highlightedId === element.id;

                return (
                  <div
                    key={element.id}
                    className={`absolute rounded-[24px] border-2 transition-all ${zone.className} ${
                      isHighlighted
                        ? 'border-[#C4A962] bg-[#C4A962]/20 shadow-[0_0_0_999px_rgba(13,10,7,0.08)]'
                        : 'border-transparent bg-transparent'
                    }`}
                  >
                    {isHighlighted && (
                      <span className="absolute left-3 top-3 rounded-full bg-[#FFFDF8] px-3 py-1 text-xs font-bold text-[#5F4B35] shadow">
                        {zone.title}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className={advancedOpen ? 'block' : 'hidden md:block'} data-ve-forms="">
        {advancedOpen && selectedZone?.targetId && (
          <style>{`
            [data-ve-forms] section:not(#${selectedZone.targetId}) {
              display: none !important;
            }
          `}</style>
        )}
        {advancedOpen && (
          <div className="sticky top-0 z-30 mb-4 rounded-b-2xl border border-t-0 px-4 py-3 shadow-sm md:hidden" style={{ background: '#FFFDF8', borderColor: '#E6D8BD' }}>
            <button
              type="button"
              className="w-full rounded-2xl px-4 py-3 text-sm font-bold"
              style={{ background: '#F2E9DA', color: '#5F4B35' }}
              onClick={handleCloseForm}
            >
              â† Volver a la invitaciÃ³n
            </button>
            {selectedZone?.title && (
              <p className="mt-1.5 text-center text-xs opacity-60" style={{ color: '#5F4B35' }}>
                Editando: {selectedZone.title}
              </p>
            )}
          </div>
        )}
        {children}
      </div>

      <VisualEditorBottomSheet
        element={selectedElement}
        open={selectedElement !== null}
        targetId={selectedZone?.targetId}
        title={selectedZone?.title}
        description={selectedZone?.description}
        onEdit={handleEditSelected}
        onClose={() => {
          setSelectedElement(null);
          setHighlightedId(null);
        }}
      />
    </>
  );
}


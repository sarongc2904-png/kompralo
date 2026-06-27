'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorV4Toolbar, type SaveStatus } from './EditorV4Toolbar';
import { EditorV4LayersPanel }  from './EditorV4LayersPanel';
import { EditorV4Canvas, type EditorV4CanvasHandle, type EditorV4CanvasMode } from './EditorV4Canvas';
import { InspectorManager }    from './core/InspectorManager';
import { useSelectionManager } from './core/SelectionManager';
import { useIsMobile }          from './hooks/useIsMobile';
import { EDITOR_V4_ELEMENT_SELECTED, EDITOR_V4_SECTION_CLICK, INVITATION_SECTIONS } from './editor-v4-events';
import { SECTION_AUTO_ELEMENT_TYPE, SECTION_CANVAS_MODE } from './core/EditorRegistry';
import type { InvitationSnapshot } from './core/editor-types';

interface EditorV4ShellProps {
  invitationId: string;
  invitationTitle: string;
  slug: string;
  classicEditorUrl: string;
  invitationSnapshot?: InvitationSnapshot;
}

const PANEL_WIDTH_LEFT  = 220;
const PANEL_WIDTH_RIGHT = 300;

export function EditorV4Shell({
  invitationId,
  invitationTitle,
  slug,
  classicEditorUrl,
  invitationSnapshot,
}: EditorV4ShellProps) {
  const isMobile  = useIsMobile();
  const canvasRef = useRef<EditorV4CanvasHandle>(null);

  const [activeSection, setActiveSection]     = useState<string | null>(null);
  const [canvasMode, setCanvasMode]           = useState<EditorV4CanvasMode>('normal');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [saveStatus, setSaveStatus]           = useState<SaveStatus>('idle');
  const saveStatusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { selectedElement, setSelectedElement, clearSelection } = useSelectionManager();

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    canvasRef.current?.refresh();
    clearSelection();
  }, [clearSelection]);

  const handleScrollTo = useCallback((sectionId: string) => {
    setActiveSection(sectionId);

    const elementType = SECTION_AUTO_ELEMENT_TYPE[sectionId];
    const mode        = SECTION_CANVAS_MODE[sectionId] ?? 'normal';

    if (elementType) {
      setCanvasMode(mode);

      let meta: Record<string, string> | undefined;
      if (sectionId === 'countdown' && invitationSnapshot) {
        meta = {
          eventDate: invitationSnapshot.eventDate ?? '',
          eventTime: invitationSnapshot.eventTime ?? '',
        };
      }

      if (sectionId === 'hero' && invitationSnapshot) {
        meta = {
          date:            invitationSnapshot.eventDate        ?? '',
          time:            invitationSnapshot.eventTime        ?? '',
          name1:           invitationSnapshot.protagonist1Name ?? '',
          name2:           invitationSnapshot.protagonist2Name ?? '',
          venueName:       invitationSnapshot.venueName        ?? '',
          emotionalPhrase: invitationSnapshot.emotionalPhrase  ?? '',
          planId:          invitationSnapshot.planId            ?? '',
          slug:            invitationSnapshot.slug             ?? slug,
          selectedVideoId: invitationSnapshot.selectedVideoId  ?? '',
          imageUrl:        invitationSnapshot.imageUrl         ?? '',
          videoUrl:        invitationSnapshot.videoUrl         ?? '',
          youtubeUrl:      invitationSnapshot.youtubeUrl       ?? '',
          musicUrl:        invitationSnapshot.musicUrl         ?? '',
          musicTitle:      invitationSnapshot.musicTitle       ?? '',
          googleMapsLink:  invitationSnapshot.googleMapsLink   ?? '',
          wazeLink:        invitationSnapshot.wazeLink         ?? '',
          eventLabel:      invitationSnapshot.eventLabel       ?? '',
          connectorText:   invitationSnapshot.connectorText    ?? '',
        };
      }

      const section = INVITATION_SECTIONS.find((s) => s.id === sectionId);
      setSelectedElement({
        type: EDITOR_V4_ELEMENT_SELECTED,
        elementType,
        fieldPath: sectionId,
        label: section?.label ?? sectionId,
        ...(meta ? { meta } : {}),
      });

      // Scroll canvas to section regardless of whether it has an inspector
      canvasRef.current?.scrollToSection(sectionId);
      if (isMobile) setMobileSheetOpen(true);
    } else {
      if (canvasMode !== 'normal') setCanvasMode('normal');
      clearSelection();
      canvasRef.current?.scrollToSection(sectionId);
    }
  }, [setSelectedElement, clearSelection, isMobile, canvasMode, invitationSnapshot]);

  const handleSaved = useCallback((fieldPath?: string, value?: string) => {
    // Show save status in toolbar for 3 s
    setSaveStatus('saved');
    if (saveStatusTimer.current) clearTimeout(saveStatusTimer.current);
    saveStatusTimer.current = setTimeout(() => setSaveStatus('idle'), 3000);

    if (fieldPath !== undefined && value !== undefined) {
      // Text field — push change directly into the iframe DOM, no reload
      canvasRef.current?.sendFieldUpdate(fieldPath, value);
    } else {
      // Structural change (datetime, hero section, …) — full iframe refresh
      setTimeout(() => canvasRef.current?.refresh(), 400);
    }
  }, []);

  const handleDesktopClear = useCallback(() => {
    clearSelection();
    setCanvasMode('normal');
  }, [clearSelection]);

  const handleMobileSheetClose = useCallback(() => {
    setMobileSheetOpen(false);
  }, []);

  // Listen for section-click events from iframe hover bridge
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === EDITOR_V4_SECTION_CLICK) {
        handleScrollTo(e.data.sectionId as string);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleScrollTo]);

  // Open mobile sheet whenever selection changes (mobile only)
  const prevSelected = useRef(selectedElement);
  if (selectedElement && selectedElement !== prevSelected.current) {
    prevSelected.current = selectedElement;
    if (isMobile) setMobileSheetOpen(true);
  }
  if (!selectedElement && prevSelected.current) {
    prevSelected.current = null;
    setMobileSheetOpen(false);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: '#F0EBE3' }}>
      <EditorV4Toolbar
        invitationTitle={invitationTitle}
        slug={slug}
        invitationId={invitationId}
        onRefresh={handleRefresh}
        classicEditorUrl={classicEditorUrl}
        isMobile={isMobile}
        saveStatus={saveStatus}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left panel — desktop only */}
        {!isMobile && (
          <div style={{
            width: PANEL_WIDTH_LEFT, flexShrink: 0,
            borderRight: '1px solid rgba(200,167,93,0.2)',
            background: '#FAF7F2', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            <EditorV4LayersPanel onScrollTo={handleScrollTo} activeSection={activeSection} />
          </div>
        )}

        {/* Canvas */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
          <EditorV4Canvas
            ref={canvasRef}
            invitationId={invitationId}
            mode={canvasMode}
            isMobile={isMobile}
          />
        </div>

        {/* Right inspector — desktop only */}
        {!isMobile && (
          <div style={{
            width: PANEL_WIDTH_RIGHT, flexShrink: 0,
            borderLeft: '1px solid rgba(200,167,93,0.2)',
            background: '#FAF7F2', overflowY: 'auto',
            display: 'flex', flexDirection: 'column',
          }}>
            <InspectorManager
              selectedElement={selectedElement}
              invitationId={invitationId}
              onClear={handleDesktopClear}
              onSaved={handleSaved}
            />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet */}
      {isMobile && mobileSheetOpen && selectedElement && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: '#FAF7F2',
          borderTop: '1px solid rgba(200,167,93,0.3)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 32px rgba(116,84,38,0.15)',
          maxHeight: '85dvh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(200,167,93,0.3)' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <InspectorManager
              selectedElement={selectedElement}
              invitationId={invitationId}
              isMobileSheet
              onClear={handleMobileSheetClose}
              onSaved={handleSaved}
            />
          </div>
        </div>
      )}

      {/* Mobile backdrop — pointer-events only when open */}
      {isMobile && mobileSheetOpen && (
        <div
          onClick={handleMobileSheetClose}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(26,20,16,0.3)' }}
        />
      )}
    </div>
  );
}

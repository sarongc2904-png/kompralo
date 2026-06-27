'use client';

import { useCallback, useRef, useState } from 'react';
import { EditorV4Toolbar } from './EditorV4Toolbar';
import { EditorV4LayersPanel } from './EditorV4LayersPanel';
import { EditorV4Canvas, type EditorV4CanvasHandle, type EditorV4CanvasMode } from './EditorV4Canvas';
import { EditorV4Inspector } from './EditorV4Inspector';
import { useEditorV4Selection } from './useEditorV4Selection';
import { EDITOR_V4_ELEMENT_SELECTED } from './editor-v4-events';
import { useIsMobile } from './useIsMobile';

interface EditorV4ShellProps {
  invitationId: string;
  invitationTitle: string;
  slug: string;
  classicEditorUrl: string;
}

const PANEL_WIDTH_LEFT  = 220;
const PANEL_WIDTH_RIGHT = 300;

export function EditorV4Shell({
  invitationId,
  invitationTitle,
  slug,
  classicEditorUrl,
}: EditorV4ShellProps) {
  const isMobile = useIsMobile();
  const canvasRef = useRef<EditorV4CanvasHandle>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<EditorV4CanvasMode>('normal');
  const { selectedElement, setSelectedElement, clearSelection } = useEditorV4Selection();

  // Mobile-only sheet open state — never touches desktop logic
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(() => {
    canvasRef.current?.refresh();
    clearSelection();
  }, [clearSelection]);

  const handleScrollTo = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'intro') {
      setCanvasMode('intro');
      setSelectedElement({
        type: EDITOR_V4_ELEMENT_SELECTED,
        elementType: 'intro',
        fieldPath: 'intro',
        label: 'Intro Cinematográfico',
      });
      // Only open the bottom sheet when actually on mobile
      if (isMobile) setMobileSheetOpen(true);
    } else {
      // Switching to any other section resets intro canvas
      if (canvasMode === 'intro') setCanvasMode('normal');
      canvasRef.current?.scrollToSection(sectionId);
    }
  }, [setSelectedElement, isMobile, canvasMode]);

  const handleSaved = useCallback(() => {
    setTimeout(() => canvasRef.current?.refresh(), 400);
  }, []);

  // Desktop ×: clears selection AND resets canvas mode
  const handleDesktopClear = useCallback(() => {
    clearSelection();
    setCanvasMode('normal');
  }, [clearSelection]);

  // Mobile sheet close: hides the sheet UI only — does NOT reset canvas or deselect
  const handleMobileSheetClose = useCallback(() => {
    setMobileSheetOpen(false);
  }, []);

  // Open mobile sheet whenever a new element is selected (mobile only)
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F0EBE3' }}>
      {/* Toolbar */}
      <EditorV4Toolbar
        invitationTitle={invitationTitle}
        slug={slug}
        invitationId={invitationId}
        onRefresh={handleRefresh}
        classicEditorUrl={classicEditorUrl}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left panel — desktop only, JS-gated */}
        {!isMobile && (
          <div style={{
            width: PANEL_WIDTH_LEFT,
            flexShrink: 0,
            borderRight: '1px solid rgba(200,167,93,0.2)',
            background: '#FAF7F2',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <EditorV4LayersPanel onScrollTo={handleScrollTo} activeSection={activeSection} />
          </div>
        )}

        {/* Canvas — always */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
          <EditorV4Canvas ref={canvasRef} invitationId={invitationId} mode={canvasMode} />
        </div>

        {/* Right inspector — desktop only, JS-gated */}
        {!isMobile && (
          <div style={{
            width: PANEL_WIDTH_RIGHT,
            flexShrink: 0,
            borderLeft: '1px solid rgba(200,167,93,0.2)',
            background: '#FAF7F2',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <EditorV4Inspector
              selectedElement={selectedElement}
              onClear={handleDesktopClear}
              invitationId={invitationId}
              onSaved={handleSaved}
            />
          </div>
        )}
      </div>

      {/* Mobile bottom sheet — JS-gated: only renders when isMobile is true */}
      {isMobile && mobileSheetOpen && selectedElement && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#FAF7F2',
          borderTop: '1px solid rgba(200,167,93,0.3)',
          borderRadius: '16px 16px 0 0',
          boxShadow: '0 -8px 32px rgba(116,84,38,0.15)',
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(200,167,93,0.3)' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <EditorV4Inspector
              selectedElement={selectedElement}
              onClear={handleMobileSheetClose}
              invitationId={invitationId}
              onSaved={handleSaved}
              isMobileSheet
            />
          </div>
        </div>
      )}

      {/* Mobile backdrop — JS-gated */}
      {isMobile && mobileSheetOpen && (
        <div
          onClick={handleMobileSheetClose}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(26,20,16,0.3)' }}
        />
      )}
    </div>
  );
}

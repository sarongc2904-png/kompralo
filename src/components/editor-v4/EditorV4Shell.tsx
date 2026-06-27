'use client';

import { useCallback, useRef, useState } from 'react';
import { EditorV4Toolbar } from './EditorV4Toolbar';
import { EditorV4LayersPanel } from './EditorV4LayersPanel';
import { EditorV4Canvas, type EditorV4CanvasHandle, type EditorV4CanvasMode } from './EditorV4Canvas';
import { EditorV4Inspector } from './EditorV4Inspector';
import { useEditorV4Selection } from './useEditorV4Selection';
import { EDITOR_V4_ELEMENT_SELECTED } from './editor-v4-events';

interface EditorV4ShellProps {
  invitationId: string;
  invitationTitle: string;
  slug: string;
  classicEditorUrl: string;
}

const PANEL_WIDTH_LEFT  = 220;
const PANEL_WIDTH_RIGHT = 300;
const TOOLBAR_HEIGHT    = 48;

export function EditorV4Shell({
  invitationId,
  invitationTitle,
  slug,
  classicEditorUrl,
}: EditorV4ShellProps) {
  const canvasRef = useRef<EditorV4CanvasHandle>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [canvasMode, setCanvasMode] = useState<EditorV4CanvasMode>('normal');
  const { selectedElement, setSelectedElement, clearSelection } = useEditorV4Selection();

  // Mobile: inspector bottom-sheet visibility
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  const handleRefresh = useCallback(() => {
    canvasRef.current?.refresh();
    clearSelection();
  }, [clearSelection]);

  const handleScrollTo = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'intro') {
      // Switch to isolated intro canvas and open intro inspector
      setCanvasMode('intro');
      setSelectedElement({
        type: EDITOR_V4_ELEMENT_SELECTED,
        elementType: 'intro',
        fieldPath: 'intro',
        label: 'Intro Cinematográfico',
      });
      setMobileInspectorOpen(true);
    } else {
      setCanvasMode('normal');
      canvasRef.current?.scrollToSection(sectionId);
    }
  }, [setSelectedElement]);

  const handleSaved = useCallback(() => {
    // Small delay so the postMessage reaches iframe before refresh
    setTimeout(() => canvasRef.current?.refresh(), 400);
  }, []);

  const handleClearSelection = useCallback(() => {
    clearSelection();
    setCanvasMode('normal');
    setMobileInspectorOpen(false);
  }, [clearSelection]);

  // When an element is selected on mobile, open the bottom sheet
  const prevSelected = useRef(selectedElement);
  if (selectedElement && selectedElement !== prevSelected.current) {
    prevSelected.current = selectedElement;
    setMobileInspectorOpen(true);
  }
  if (!selectedElement && prevSelected.current) {
    prevSelected.current = null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#F0EBE3' }}>
      {/* ── Toolbar (top, full width) ── */}
      <EditorV4Toolbar
        invitationTitle={invitationTitle}
        slug={slug}
        invitationId={invitationId}
        onRefresh={handleRefresh}
        classicEditorUrl={classicEditorUrl}
      />

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left panel: Layers (desktop only) ── */}
        <div
          style={{
            width: PANEL_WIDTH_LEFT,
            flexShrink: 0,
            borderRight: '1px solid rgba(200,167,93,0.2)',
            background: '#FAF7F2',
            overflowY: 'auto',
          }}
          className="hidden md:flex flex-col"
        >
          <EditorV4LayersPanel
            onScrollTo={handleScrollTo}
            activeSection={activeSection}
          />
        </div>

        {/* ── Canvas (center) ── */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', overflow: 'hidden' }}>
          <EditorV4Canvas
            ref={canvasRef}
            invitationId={invitationId}
            mode={canvasMode}
          />
        </div>

        {/* ── Right panel: Inspector (desktop only) ── */}
        <div
          style={{
            width: PANEL_WIDTH_RIGHT,
            flexShrink: 0,
            borderLeft: '1px solid rgba(200,167,93,0.2)',
            background: '#FAF7F2',
          }}
          className="hidden md:flex flex-col"
        >
          <EditorV4Inspector
            selectedElement={selectedElement}
            onClear={handleClearSelection}
            invitationId={invitationId}
            onSaved={handleSaved}
          />
        </div>
      </div>

      {/* ── Mobile: Inspector bottom sheet ── */}
      {mobileInspectorOpen && selectedElement && (
        <div
          className="md:hidden flex flex-col"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#FAF7F2',
            borderTop: '1px solid rgba(200,167,93,0.3)',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -8px 32px rgba(116,84,38,0.15)',
            // dvh shrinks when the virtual keyboard opens, keeping buttons visible
            maxHeight: '85dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px', flexShrink: 0 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(200,167,93,0.3)' }} />
          </div>

          {/* Scrollable body — grows to fill available space above the keyboard */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <EditorV4Inspector
              selectedElement={selectedElement}
              onClear={handleClearSelection}
              invitationId={invitationId}
              onSaved={handleSaved}
              isMobileSheet
            />
          </div>
        </div>
      )}

      {/* ── Mobile: overlay backdrop ── */}
      {mobileInspectorOpen && (
        <div
          className="md:hidden"
          onClick={handleClearSelection}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(26,20,16,0.3)' }}
        />
      )}
    </div>
  );
}

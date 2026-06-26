'use client';

import React, { useEffect, useRef } from 'react';

type EditableTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'strong' | 'em';

interface EditableTextProps {
  value: string;
  fieldPath: string;
  isEditable?: boolean;
  as?: EditableTag;
  className?: string;
  style?: React.CSSProperties;
  singleLine?: boolean;
  fallback?: string;
  onCommit?: (fieldPath: string, value: string) => void;
}

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function EditableText({
  value,
  fieldPath,
  isEditable = false,
  as = 'span',
  className,
  style,
  singleLine = true,
  fallback = '',
  onCommit,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const originalValueRef = useRef(value || fallback);
  const displayValue = value || fallback;

  useEffect(() => {
    originalValueRef.current = displayValue;
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.textContent = displayValue;
    }
  }, [displayValue]);

  function commit() {
    if (!isEditable || !ref.current) return;
    const nextValue = sanitizeText(ref.current.textContent ?? '');
    const safeValue = nextValue || fallback;
    ref.current.textContent = safeValue;

    if (safeValue === originalValueRef.current) return;
    originalValueRef.current = safeValue;

    if (onCommit) {
      onCommit(fieldPath, safeValue);
      return;
    }

    window.parent?.postMessage(
      {
        type: 'KOMPRALO_INLINE_EDIT',
        fieldPath,
        value: safeValue,
      },
      window.location.origin,
    );
  }

  function cancel() {
    if (!ref.current) return;
    ref.current.textContent = originalValueRef.current;
    ref.current.blur();
  }

  return React.createElement(
    as,
    {
      ref,
      className,
      style,
      contentEditable: isEditable,
      suppressContentEditableWarning: true,
      spellCheck: isEditable ? true : undefined,
      tabIndex: isEditable ? 0 : undefined,
      role: isEditable ? 'textbox' : undefined,
      'aria-label': isEditable ? `Editar ${fieldPath}` : undefined,
      'data-editable-field': isEditable ? fieldPath : undefined,
      onBlur: isEditable ? commit : undefined,
      onPaste: isEditable
        ? (event: React.ClipboardEvent<HTMLElement>) => {
            event.preventDefault();
            const text = sanitizeText(event.clipboardData.getData('text/plain'));
            document.execCommand('insertText', false, text);
          }
        : undefined,
      onKeyDown: isEditable
        ? (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              cancel();
              return;
            }
            if (singleLine && event.key === 'Enter') {
              event.preventDefault();
              commit();
              ref.current?.blur();
            }
          }
        : undefined,
    },
    displayValue,
  );
}

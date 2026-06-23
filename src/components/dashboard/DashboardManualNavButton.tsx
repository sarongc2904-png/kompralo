'use client';

export function DashboardManualNavButton() {
  function handleClick() {
    window.dispatchEvent(new Event('kompralo:open-manual'));
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: 'none',
        border: '1px solid rgba(200,167,93,0.5)',
        borderRadius: 20,
        padding: '0.25rem 0.75rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#C8A75D',
        cursor: 'pointer',
        minHeight: 32,
        lineHeight: 1,
      }}
    >
      📖 Manual
    </button>
  );
}

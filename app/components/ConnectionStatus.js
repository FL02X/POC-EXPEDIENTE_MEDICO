'use client'

export function ConnectionStatus({ connected }) {
  return (
    <div className="mb-4 p-3 rounded-lg border flex items-center gap-2" 
         style={{
           backgroundColor: connected ? '#dcfce7' : '#fee2e2',
           borderColor: connected ? '#86efac' : '#fca5a5'
         }}>
      <div
        className="w-3 h-3 rounded-full"
        style={{
          backgroundColor: connected ? '#22c55e' : '#ef4444',
          animation: connected ? 'pulse 2s infinite' : 'none'
        }}
      />
      <span className="text-sm font-medium">
        {connected ? '✓ Conectado al sistema' : '✗ Desconectado'}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

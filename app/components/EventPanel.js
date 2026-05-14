'use client'

export function EventPanel({ events, onClear, title = 'Eventos del Sistema' }) {
  const getTypeColor = (type) => {
    switch(type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">{title}</h3>
        {events.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Limpiar
          </button>
        )}
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin eventos aún...</p>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className={`border rounded p-2 text-sm ${getTypeColor(event.type)}`}
            >
              <div className="flex justify-between">
                <span className="font-semibold">{event.source}</span>
                <span className="text-xs opacity-75">{event.timestamp}</span>
              </div>
              <p className="mt-1">{event.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

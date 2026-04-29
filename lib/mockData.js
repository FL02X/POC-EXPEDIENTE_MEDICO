import fs from 'fs'
import path from 'path'

// Datos ficticios.
export const patients = {
  '1': {
    id: '1',
    nombre: 'Juan Pérez',
    cedula: '12345678',
    expediente: {
      edad: 35,
      peso: '75 kg',
      alergias: 'Ninguna',
      diagnosticos: ['Hipertensión leve'],
      medicamentos: ['Enalapril 5mg']
    }
  }
}

// Persistencia de permisos JSON dentro de /data
const dataDir = path.join(process.cwd(), 'data')
const permissionsFile = path.join(dataDir, 'permissions.json')

function ensureData() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(permissionsFile)) {
    fs.writeFileSync(permissionsFile, JSON.stringify({ '1': false }, null, 2))
  }
}

function readPermissions() {
  try {
    ensureData()
    const raw = fs.readFileSync(permissionsFile, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    return { '1': false }
  }
}

function writePermissions(obj) {
  ensureData()
  fs.writeFileSync(permissionsFile, JSON.stringify(obj, null, 2))
}

// API simple para consultar/actualizar permisos
export function hasPermission(pacienteId) {
  const all = readPermissions()
  return !!all[pacienteId]
}

export function setPermission(pacienteId, value) {
  const all = readPermissions()
  all[pacienteId] = !!value
  writePermissions(all)
  return all[pacienteId]
}

export function grantPermission(pacienteId) {
  return setPermission(pacienteId, true)
}

export function revokePermission(pacienteId) {
  return setPermission(pacienteId, false)
}

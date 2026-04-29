import fs from 'fs'
import path from 'path'
import os from 'os'

// Datos ficticios (estáticos)
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

const inMemoryPermissions = { '1': false }
const tmpDir = path.join(os.tmpdir(), 'poc-expediente')
const permissionsFile = path.join(tmpDir, 'permissions.json')

function ensureData() {
  try {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
    if (!fs.existsSync(permissionsFile)) {
      fs.writeFileSync(permissionsFile, JSON.stringify(inMemoryPermissions, null, 2))
    }
    return true
  } catch (e) {
    return false
  }
}

function readPermissions() {
  try {
    if (fs.existsSync(permissionsFile)) {
      const raw = fs.readFileSync(permissionsFile, 'utf8')
      return JSON.parse(raw)
    }
    ensureData()
    if (fs.existsSync(permissionsFile)) {
      const raw = fs.readFileSync(permissionsFile, 'utf8')
      return JSON.parse(raw)
    }
  } catch (e) {
    return inMemoryPermissions
  }
  return inMemoryPermissions
}

function writePermissions(obj) {
  try {
    ensureData()
    fs.writeFileSync(permissionsFile, JSON.stringify(obj, null, 2))
    // actualizar memoria
    Object.keys(inMemoryPermissions).forEach(k => delete inMemoryPermissions[k])
    Object.assign(inMemoryPermissions, obj)
    return true
  } catch (e) {
    Object.keys(inMemoryPermissions).forEach(k => delete inMemoryPermissions[k])
    Object.assign(inMemoryPermissions, obj)
    return false
  }
}

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

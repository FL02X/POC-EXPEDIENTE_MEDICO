const express = require('express');

const app = express();
app.use(express.json());

const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'supersecrettoken123';
const PORT = process.env.EXPEDIENTE_PORT || 4002;

// MOCK DATA
const patients = {
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
};

// VALIDA x-service-token
app.use((req, res, next) => {
  const token = req.headers['x-service-token'];
  if (!token || token !== SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing service token' });
  }
  next();
});

// Endpoint: POST /expediente/fetch
// Body: { pacienteId: string, validated: boolean }
// Lógica: si validated es false, retorna 403; si true, retorna expediente
app.post('/expediente/fetch', (req, res) => {
  try {
    const { pacienteId, validated } = req.body || {};

    if (!validated) {
      return res.status(403).json({ error: 'Acceso denegado: paciente no validado' });
    }

    const patient = patients[pacienteId];
    if (!patient) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.status(200).json(patient.expediente);
  } catch (err) {
    console.error('Error en expediente/fetch:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Expediente service escuchando en puerto ${PORT}`);
});

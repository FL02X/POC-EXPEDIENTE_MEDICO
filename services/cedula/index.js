const express = require('express');

const app = express();
app.use(express.json());

const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'supersecrettoken123';
const PORT = process.env.CEDULA_PORT || 4003;

// VALIDA x-service-header
app.use((req, res, next) => {
  const token = req.headers['x-service-token'];
  if (!token || token !== SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing service token' });
  }
  next();
});

// Endpoint: POST /cedula/validate
// Body: { cedula: string }
// Lógica: válida si tiene 8-12 caracteres numéricos
app.post('/cedula/validate', (req, res) => {
  try {
    const { cedula } = req.body || {};

    if (!cedula || typeof cedula !== 'string') {
      return res.status(400).json({ valid: false, reason: 'Cédula debe ser una cadena' });
    }

    // VALIDA 8-12 CARACTERES NUMERICOS...
    const isValid = /^\d{8,12}$/.test(cedula);

    if (isValid) {
      res.status(200).json({ valid: true });
    } else {
      res.status(200).json({ valid: false, reason: 'Formato inválido: debe tener 8-12 dígitos' });
    }
  } catch (err) {
    console.error('Error en cedula/validate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Cedula service escuchando en puerto ${PORT}`);
});

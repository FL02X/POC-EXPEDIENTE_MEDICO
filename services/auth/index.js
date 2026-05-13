const express = require('express');

const app = express();
app.use(express.json());

const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'supersecrettoken123';
const PORT = process.env.AUTH_PORT || 4001;

// Middleware: validar header x-service-token en todas las requests
app.use((req, res, next) => {
  const token = req.headers['x-service-token'];
  if (!token || token !== SERVICE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: invalid or missing service token' });
  }
  next();
});

// Endpoint: POST /auth/validate
// Body: { token: string }
// Lógica: cualquier token no vacío es válido (para PoC)
app.post('/auth/validate', (req, res) => {
  try {
    const { token } = req.body || {};
    
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({ success: false, error: 'Token inválido o vacío' });
    }

    // En una PoC, cualquier token no vacío pasa
    res.status(200).json({ success: true, service: 'auth' });
  } catch (err) {
    console.error('Error en auth/validate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service escuchando en puerto ${PORT}`);
});

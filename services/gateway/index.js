const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())

const SERVICE_TOKEN = process.env.SERVICE_TOKEN || 'supersecrettoken123'
const PORT = process.env.GATEWAY_PORT || 4000
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4001'
const CEDULA_URL = process.env.CEDULA_URL || 'http://localhost:4003'
const EXPEDIENTE_URL = process.env.EXPEDIENTE_URL || 'http://localhost:4002'

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq'
const EVENTS_EXCHANGE = 'events'

let amqpConn = null
let amqpChannel = null

async function connectRabbit(retries = 5, delayMs = 3000) {
	const amqplib = require('amqplib')
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			amqpConn = await amqplib.connect(RABBITMQ_URL)
			amqpChannel = await amqpConn.createChannel()
			await amqpChannel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: false })
			console.log('Connected to RabbitMQ at', RABBITMQ_URL)
			return
		} catch (err) {
			console.warn(`RabbitMQ connect attempt ${attempt} failed: ${err && err.message}`)
			if (attempt < retries) await new Promise(r => setTimeout(r, delayMs))
			else console.error('RabbitMQ: all connection attempts failed')
		}
	}
}

function publishEvent(routingKey, payload) {
	try {
		if (!amqpChannel) {
			console.warn('publishEvent: no amqpChannel available')
			return false
		}
		const buf = Buffer.from(JSON.stringify(payload))
		return amqpChannel.publish(EVENTS_EXCHANGE, routingKey, buf)
	} catch (e) {
		console.error('publishEvent error:', e && e.message)
		return false
	}
}

const permissions = {}

app.post('/api/gateway', async (req, res) => {
	const body = req.body || {}
	const action = body.action
	const trace = []

	try {
		if (action === 'get_permission') {
			const { pacienteId } = body
			trace.push(`get_permission check for ${pacienteId}`)
			return res.json({ permission: !!permissions[pacienteId], trace })
		}

		if (action === 'grant_permission') {
			const { pacienteId, token } = body
			trace.push('grant_permission start')

			// validar identidad del token con el servicio de auth
			trace.push('call auth.validate')
			const authRes = await axios.post(`${AUTH_URL}/auth/validate`, { token }, { headers: { 'x-service-token': SERVICE_TOKEN } })
			if (!authRes || !authRes.data || !authRes.data.success) {
				trace.push('auth failed')
				return res.status(401).json({ success: false, error: 'Autenticación fallida', trace })
			}
			trace.push('auth success')

			permissions[pacienteId] = true
			trace.push(`permission set for ${pacienteId}`)
			// PUBLICA EVENTO
			const event = {
				type: 'permission',
				action: 'granted',
				pacienteId: String(pacienteId),
				at: new Date().toISOString()
			}
			const published = publishEvent('permission.granted', event)
			trace.push(`event_published:${published}`)
			return res.json({ success: true, permission: permissions[pacienteId], trace })
		}

		if (action === 'request_expediente') {
			const { medicoCedula, pacienteId } = body
			trace.push('request_expediente start')

			// VALIDAR CEDULA
			trace.push('call cedula.validate')
			const cedulaRes = await axios.post(`${CEDULA_URL}/cedula/validate`, { cedula: medicoCedula }, { headers: { 'x-service-token': SERVICE_TOKEN } })
			if (!cedulaRes || !cedulaRes.data || !cedulaRes.data.valid) {
				trace.push('cedula invalid')
				return res.status(400).json({ error: 'Cédula inválida', trace })
			}
			trace.push('cedula valid')

			trace.push('check permission')
			if (!permissions[pacienteId]) {
				trace.push('no permission')
				return res.status(403).json({ error: 'Paciente no otorgó permiso', trace })
			}
			trace.push('permission ok')

			trace.push('call expediente.fetch')
			const expedienteRes = await axios.post(`${EXPEDIENTE_URL}/expediente/fetch`, { pacienteId, validated: true }, { headers: { 'x-service-token': SERVICE_TOKEN } })
			trace.push('expediente fetched')
			return res.json({ expediente: expedienteRes.data, trace })
		}

		return res.status(400).json({ error: 'Acción no soportada', trace })
	} catch (e) {
		console.error('Gateway error:', e && e.message)
		return res.status(500).json({ error: 'Internal Server Error', detail: String(e && e.message), trace })
	}
})

// INTENTA CONECTAR A RABBITMQ
connectRabbit().catch(() => {})

app.listen(PORT, () => {
	console.log(`Gateway service escuchando en puerto ${PORT}`)
})

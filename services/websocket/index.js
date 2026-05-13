const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const amqplib = require('amqplib')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST']
	}
})

const PORT = process.env.WEBSOCKET_PORT || 4004
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq'
const EVENTS_EXCHANGE = 'events'

let amqpConn = null
let amqpChannel = null

app.get('/health', (_req, res) => {
	res.json({ ok: true, service: 'websocket' })
})

io.on('connection', socket => {
	console.log(`Socket connected: ${socket.id}`)

	socket.on('disconnect', reason => {
		console.log(`Socket disconnected: ${socket.id} (${reason})`) 
	})
})

async function connectRabbit(retries = 5, delayMs = 3000) {
	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			amqpConn = await amqplib.connect(RABBITMQ_URL)
			amqpChannel = await amqpConn.createChannel()
			await amqpChannel.assertExchange(EVENTS_EXCHANGE, 'topic', { durable: false })

			const q = await amqpChannel.assertQueue('', {
				exclusive: true,
				durable: false,
				autoDelete: true
			})

			await amqpChannel.bindQueue(q.queue, EVENTS_EXCHANGE, 'permission.*')
			console.log(`RabbitMQ connected, queue bound: ${q.queue}`)

			amqpChannel.consume(q.queue, msg => {
				if (!msg) return
				try {
					const payload = JSON.parse(msg.content.toString())
					console.log('RabbitMQ event received:', payload)
					io.emit('permission.update', payload)
				} catch (err) {
					console.error('Failed to process RabbitMQ message:', err && err.message)
				} finally {
					amqpChannel.ack(msg)
				}
			})

			if (amqpConn) {
				amqpConn.on('close', () => {
					console.warn('RabbitMQ connection closed')
					amqpConn = null
					amqpChannel = null
				})
			}

			return
		} catch (err) {
			console.warn(`RabbitMQ connect attempt ${attempt} failed: ${err && err.message}`)
			if (attempt < retries) {
				await new Promise(resolve => setTimeout(resolve, delayMs))
			} else {
				console.error('RabbitMQ: all connection attempts failed')
			}
		}
	}
}

server.listen(PORT, () => {
	console.log(`WebSocket service listening on port ${PORT}`)
})

connectRabbit().catch(err => {
	console.error('RabbitMQ bootstrap error:', err && err.message)
})

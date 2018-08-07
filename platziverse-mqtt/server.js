'use strict'

const debug = require('debug')('platziverse:mqtt')
const mosca = require('mosca')
const redis = require('redis')
const chalk = require('chalk')
const db = require('platziverse-db')
const config = require('platziverse-config')
const { parsePayload } = require('platziverse-utils')

const backend = {
  type: 'redis',
  redis,
  return_buffers: true
}

const settings = {
  port: 1883,
  backend
}

const server = new mosca.Server(settings)
const clients = new Map()

let Agent, Metric

// Cuando el cliente MQTT se conecta
server.on('clientConnected', client => {
  clients.set(client.id, null)
  debug(`Client Connected: ${client.id}`)
})

// Cuando el cliente MQTT se desconecta
server.on('clientDisconnected', async client => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)

  if (agent) {
    // Marcar agente como desconectado
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }

    // Borrar Agent de clientes
    clients.delete(client.id)
    server.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    })

    debug(`Client (${client.id}) associated to Agent ${agent.uuid} marked as disconnected`)
  }
})

server.on('published', async (packet, client) => {
  debug(`Received: ${packet.topic}`)

  switch (packet.topic) {
    // Cuando el agente se connecta o desconecta
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    // Cuando el agente publica un mensaje
    case 'agent/message':
      debug(`Payload: ${packet.payload}`)
      const payload = parsePayload(packet.payload)

      if (payload) {
        payload.agent.connected = true

        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }

        debug(`Agent: ${agent.uuid} saved`)

        // Notificar que el agente esta conectado
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          server.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }

        // Store Metrics
        try {
          await Promise.all(payload.metrics.map(metric => Metric.create(agent.uuid, metric).catch(handleError)))
        } catch (err) {
          return handleError(err)
        }
      }
      break
  }
})

server.on('ready', async () => {
  const services = await db(config.db).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  console.log(`${chalk.green('[platziverse-mqtt]')} server is running`)
})

server.on('error', handleFatalError)

function handleFatalError(error) {
  console.error(`${chalk.red('[FATAL ERROR]')} ${error.message}`)
  console.error(error.stack)
  process.exit(1)
}

function handleError(err) {
  console.error(`${chalk.red('[ERROR]')} ${err.message}`)
  console.error(err.stack)
}

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

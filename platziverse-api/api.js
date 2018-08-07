'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')

const db = require('platziverse-db')
const config = require('platziverse-config')

const { AgentNotFoundError, MetricsNotFoundError } = require('./errors')

const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database...')
    try {
      services = await db(config.db)
      Agent = services.Agent
      Metric = services.Metric
      if (services) {
        debug('Connected! database connection success :)')
      }
    } catch (err) {
      return next(err)
    }
  }
  next()
})

api.get('/agents', async (req, res, next) => {
  debug(`A request has come to /agents`)

  let agents = []

  try {
    agents = await Agent.findConnected()
  } catch (e) {
    next(e)
  }

  res.send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`A request has come to /agent/${uuid}`)

  let agent

  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    next(e)
  }

  if (!agent) {
    return next(new AgentNotFoundError(uuid))
  }

  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /metrics/${uuid}`)

  let metrics = []

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (err) {
    return next(err)
  }

  if (!metrics || metrics.length === 0) {
    return next(new MetricsNotFoundError(uuid))
  }

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params

  debug(`request to /metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (err) {
    return next(err)
  }

  if (!metrics || metrics.length === 0) {
    return next(new MetricsNotFoundError(uuid, type))
  }

  res.send(metrics)
})

module.exports = api

'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')

const db = require('platziverse-db')
const config = require('platziverse-config')

const { AgentNotFoundError } = require('./errors')

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

api.get('/agents', (req, res) => {
  debug(`A request has come to /agents`)
  res.send({})
})

api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params

  if (uuid !== 'yyy') {
    return next(new AgentNotFoundError(uuid, 'Agent not found'))
  }

  res.send({ uuid })
})

api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params

  res.send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params
  res.send({ uuid, type })
})

module.exports = api

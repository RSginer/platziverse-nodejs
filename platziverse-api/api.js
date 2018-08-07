'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')

const db = require('platziverse-db')
const config = require('platziverse-config')

const { AgentNotFoundError } = require('./errors')

const api = express.Router()

let services, Agent, metric

api.use('*', async (req, res, next) => {
  if (!services) {
    services = await db()
  }
})

api.get('/agents', (req, res) => {
  debug(`A request has come to /agents`)
  res.send({})
})

api.get('/agent/:uuid', (req, res, next) => {
  const { uuid } = req.params
  
  if (uuid !== 'yyy') {
    return next(new AgentNotFoundError(uuid))
  }

  res.send({uuid})
})

api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params

  res.send({uuid})
})

api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params
  res.send({uuid, type})
})

module.exports = api

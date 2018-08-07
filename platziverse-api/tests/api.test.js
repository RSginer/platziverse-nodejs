'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const { AgentFixtures } = require('platziverse-mock')

let config = {
  db: {
    logging: s => {}
  }
}
let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  const api = proxyquire('../api', {
    'platziverse-db': dbStub,
    'platziverse-config': config
  })

  const server = proxyquire('../server', {
    './api': api,
    'platziverse-config': config
  })

})

test.afterEach(async () => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = res.body
      t.deepEqual(body, {}, 'response body should be the expected')
      t.end()
    })
})

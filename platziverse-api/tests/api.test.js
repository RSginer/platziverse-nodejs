'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const { AgentFixture, MetricFixture } = require('platziverse-mock')
let config = {
  db: {
    logging: s => { }
  }
}
let uuid = AgentFixture.single.uuid
let type = 'ram'
let typeNotFound = 'memory'
let notFoundUuid = 'wololo-wololo'
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

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(AgentFixture.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(AgentFixture.single))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(MetricFixture.findByAgentUuid(uuid)))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(MetricFixture.findByTypeAgentUuid(type, uuid)))

  const api = proxyquire('../api', {
    'platziverse-db': dbStub,
    'platziverse-config': config
  })

  server = proxyquire('../server', {
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
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(AgentFixture.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb(`/api/agent/:uuid`, t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(AgentFixture.single)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agent/${notFoundUuid}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify({
        error: `Agent with UUID ${notFoundUuid} not found`
      })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(MetricFixture.findByAgentUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - not found', t => {
  request(server)
    .get(`/api/metrics/${notFoundUuid}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res ) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify({
        error: `Agent with UUID ${notFoundUuid} not found`
      })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(MetricFixture.findByTypeAgentUuid(type, uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get(`/api/metrics/${notFoundUuid}/${typeNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify({
        error: `Metrics of Agent with UUID ${notFoundUuid} and type ${typeNotFound} not found`
      })
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

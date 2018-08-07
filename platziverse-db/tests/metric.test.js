'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const { AgentFixture, MetricFixture } = require('platziverse-mock')


let config = {
  logging: function () { }
}

let db = null
let sandbox = null

let MetricStub = null;
let AgentStub = null;

let agentUuid = 'yyy-yyy-yyy';

let newMetric = {
  id: 1,
  type: 'cpu',
  value: '85%',
  createdAt: new Date(),
  updatedAt: new Date(),
  agent: {
    id: 1,
    uuid: agentUuid,
    name: 'fixture',
    username: 'platzi',
    hostname: 'test-host',
    pid: 0,
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

let uuidArgs = {
  where: {
    uuid: agentUuid
  }
}
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  // AgentModel
  AgentStub = {
    hasMany: sinon.spy()
  }

  // AgentModel findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(AgentFixture.findByUuid(agentUuid)))

  // MetricModel
  MetricStub = {
    belongsTo: sandbox.spy()
  }

  // MetricModel create
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON: () => MetricFixture.findByAgentUuid(newMetric.agent.uuid)
  }))

  const setupDatabase = proxyquire('../index', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Metric#create', async t => {
  let metric = await db.Metric.create(agentUuid, newMetric)

  t.true(AgentStub.findOne.called, 'AgentModel#findOne was executed')
  t.true(AgentStub.findOne.calledOnce, 'AgentModel#findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'AgentModel#findOne should be called with specified args')
  t.true(MetricStub.create.called, 'MetricModel#create was executed')

  t.deepEqual(metric, MetricFixture.findByAgentUuid(agentUuid), 'should be the same')
})

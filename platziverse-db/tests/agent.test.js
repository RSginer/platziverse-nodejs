'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')

let config = {
  logging: function () {}
}

let MetricStub = {
  belongsTo: sinon.spy()
}
let AgentStub = null

let single = Object.assign({}, agentFixtures.single)
let id = 1
let uuid = 'yyy-yyy-yyy'
let username = 'platzi'
let db = null
let sandbox = null

let newAgent = {
  id: 99,
  uuid: 'xxx-xxx-xxx',
  name: 'fixture',
  username: 'new',
  hostname: 'test-new',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

let usernameArgs = {
  where: {
    username,
    connected: true
  }
}
let connectedArgs = {
  where: {
    connected: true
  }
}
let uuidArgs = {
  where: {
    uuid
  }
}

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }

  // Model findAll
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.platzi))

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))

  // Model findById Stub
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.findById(id)))

  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON: () => newAgent
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

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on the model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.findById(id), 'should be the same')
})

test.serial('Agent#createOrUpdate - update', async t => {
  let agent = await db.Agent.createOrUpdate(single)
  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'should be the same')
})

test.serial('Agent#createOrUpdate - create', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called twice')
  t.true(AgentStub.create.calledOnce, 'create should be called once')
  t.true(AgentStub.create.calledWith(newAgent), 'create should be called with specified args')

  t.deepEqual(agent, newAgent, 'should be the same')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)
  t.true(AgentStub.findOne.called, 'findOne should be called')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified args')

  t.deepEqual(agent, agentFixtures.findByUuid(uuid), 'should be the same')
})

test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called')

  t.deepEqual(agents, agentFixtures.all, 'should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be called with specified args')

  t.deepEqual(agents, agentFixtures.connected, 'should be the same')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername(username)

  t.true(AgentStub.findAll.called, 'findAll should be called')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with specified args')

  t.deepEqual(agents, agentFixtures.platzi, 'should be the same')
})

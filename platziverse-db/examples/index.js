'use strict'

const db = require('../')
const config = require('platziverse-config').db
async function run () {


  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'rrr-rrr-rrr',
    name: 'ruben',
    username: 'rubentest',
    hostname: 'test',
    pid: 1,
    connected: true
  })

  console.log('--agent--')
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  console.log('--agents--')
  console.log(agents)


  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  console.log('--metrics--')
  console.log(metrics)

  const metricsByType = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)

  console.log('--metrics of memory --')
  console.log(metricsByType)


  function handleFatalError (err) {
    console.error(err.message)
    console.error(err.stack)
    process.exit(1)
  }

}

run()
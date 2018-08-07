const PlatziverseAgent = require('../index')

const agent = new PlatziverseAgent({
  name: 'myapp',
  username: 'admin',
  interval: 2000
})

agent.addMetric('memory', function getRss() {
  return process.memoryUsage().heapTotal
})

/* agent.addMetric('promiseMetric', function getRandomPromise() {
  return Promise.resolve(Math.random())
})

agent.addMetric('callbackMetric', function getRandomCallBack(callback) {
  setTimeout(() => {
    callback(null, Math.random())
  })
}) */

agent.connect()

// This agent only
agent.on('connected', handler)
agent.on('disconnected', handler)
agent.on('message', handler)

// Other Agents
agent.on('agent/connected', handler)
agent.on('agent/disconnected', handler)
agent.on('agent/message', handler)

function handler (payload) {
  console.log(payload)
}

setTimeout(() => agent.disconnect(), 20000)
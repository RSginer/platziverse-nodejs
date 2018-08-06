'use strict'

const metric = {
  id: 1,
  type: 'cpu',
  value: '85%',
  createdAt: new Date(),
  updatedAt: new Date(),
  agent: {
    id: 1,
    uuid: 'yyy-yyy-yyy',
    name: 'fixture',
    username: 'platzi',
    hostname: 'test-host',
    pid: 0,
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const metrics = [
  metric,
  extend(metric, { id: 2, type: 'ram' }),
  extend(metric, { id: 3, type: 'temperature', value: '55ºC' }),
  extend(metric, { id: 4, type: 'disk', value: '50%', agent: {
    id: 1,
    uuid: 'yyy-yyx-yee',
    name: 'fixture',
    username: 'platzom',
    hostname: 'test-host',
    pid: 0,
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
  } }),
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics,
  findByAgentUuid: uuid => metrics.filter((m) => {
    if (m.agent) {
      return m.agent.uuid === uuid
    }
  }),
  findByTypeAgentUuid: (type, uuid) => metric.filter((m) => {
    if (m.agent) {
      return m.type === type && m.agent.uuid === uuid
    }
  })
}

'use strict'

const agent = {
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

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'yyy-yyy-yyt', connected: false, username: 'test' }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx', connected: true, username: 'test' }),
  extend(agent, { id: 4, uuid: 'yyy-yyy-yyz', connected: false, username: 'test' })
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: agent,
  all: agents,
  connected: agents.filter(a => a.connected === true),
  platzi: agents.filter(a => a.username === 'platzi'),
  findByUuid: id => agents.filter(a => a.uuid === id).shift(),
  findById: id => agents.filter(a => a.id === id).shift()
}

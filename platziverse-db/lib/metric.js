'use strict'

module.exports = function setupMetric(MetricModel, AgentModel) {

  async function findByAgentUuid (uuid) {
    
  }

  async function create(uuid, metric) {
    const agent = await AgentModel.findOne({
      where: {
        uuid
      }
    })

    if (agent) {
      Object.assign(metric, { agentId: agent.id })
      const result = await MetricModel.create(metric)
      return result.toJSON()
    }

  }

  return {
    create
  }
}
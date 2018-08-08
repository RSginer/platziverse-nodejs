'use strict'

class AgentNotFoundError extends Error {
  constructor (givenUuid, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.code = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `Agent with UUID ${givenUuid} not found`
  }
}
class MetricsNotFoundError extends Error {
  constructor (givenUuid, type, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.type = type || null
    this.code = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = (type) ? `Metrics of Agent with UUID ${givenUuid} and type ${type} not found` : `Agent with UUID ${givenUuid} not found`
  }
}
class NotAuthorizedError extends Error {
  constructor (...params) {
    super(...params)

    this.code = 401

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `User not authorized to access the requested content`
  }
}

class NotAuthenticatedError extends Error {
  constructor (givenUuid, ...params) {
    super(...params)

    this.givenUuid = givenUuid
    this.code = 401

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }

    this.message = `User is not authenticated`
  }
}

module.exports = {
  AgentNotFoundError,
  NotAuthenticatedError,
  NotAuthorizedError,
  MetricsNotFoundError
}

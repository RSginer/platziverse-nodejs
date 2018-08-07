'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./index')
const config = require('platziverse-config')
const prompt = inquirer.createPromptModule()

async function setup() {
  let answer = {}
  if (process.argv.pop() !== '-y' && process.argv.pop() !== '--yes' && process.argv.pop() !== 'y') {
    answer = await prompt({
      type: 'confirm',
      name: 'setup',
      message: 'This will destroy your database, are you sure?'
    })

  }
  if (!answer.setup) {
    return console.log('Nothing happened! :)')
  }

  config.db.setup = true

  await db(config.db).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError(err) {
  console.error(`${chalk.red('[FATAL ERROR MESSAGE]')} ${err.message}`)
  console.error(`${chalk.red('[FATAL ERROR STACK]')} ${err.stack}`)
  process.exit(1)
}

setup()

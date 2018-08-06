'use strict'

const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const chalk = require('chalk')
const db = require('./index')

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

  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError(err) {
  console.error(`${chalk.red('[FATAL ERROR MESSAGE]')} ${err.message}`)
  console.error(`${chalk.red('[FATAL ERROR STACK]')} ${err.stack}`)
  process.exit(1)
}

setup()

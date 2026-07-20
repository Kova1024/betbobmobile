'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API_BASE_URL: '"https://devops.8888880.vip"',
  SPONSOR_BASE_URL: '"https://devops.8888880.vip"'
})

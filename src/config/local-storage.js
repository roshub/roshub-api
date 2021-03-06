'use strict';

const deepSet = require('deep-set')
const reach = require('../reach')
const logger = require('debug')('roshub-api.config.local-storage');

/**
 * @class
 * @implements {Config}
 */
class LocalStorageConfig {

  constructor(defaults, whitelist){
    this.whitelist = whitelist || []
    defaults = defaults || {}
    this.basePath = defaults.basePath || 'roshub-api'
    this.defaults = defaults || {}
    this.defaults.logicalSeparator = '.'
  }

  start () {
    return Promise.resolve(this)
  }

  clear () {
    localStorage.setItem(this.basePath, JSON.stringify({}))
  }

  readAll(){
    try{
      return Object.assign(
        {},
        this.defaults,
        JSON.parse( localStorage.getItem(this.basePath) || '{}' )
      )
    }
    catch(err){
      return {}
    }
  }

  read(key){
    logger('reading path: ' + key)
    return reach( this.readAll(), key)
  }

  async write(key, value){

    let data = this.readAll()

    deepSet(data, key, value)

    localStorage.setItem(this.basePath, JSON.stringify(data))

    return
  }


  exists(key){
    return (read(key) !== undefined)
  }

  async save(){
    return
  }
}

module.exports = LocalStorageConfig
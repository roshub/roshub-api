const debug = require('debug')('roshub.factory.device-status')
const reach = require('../../reach')
const deepSet = require('deep-set')
const Document = require('../document')
const Identity = require('./identity')

/**
 * @class
 * @alias module:roshub/Types.DeviceStatus
 * @implements {module:roshub.DataParty.Document}
 */
class DeviceStatus extends Document {
  constructor({ party, type, id, data }) {
    super({ party, type, id, data })
    debug('instantiated - ', this.id)
  }

  getState(){
    return reach(this.data, 'state')
  }

  setState(val){
    deepSet(this.data, 'state', val)
  }

  isEnrolled() {
    return !!this.data.lastChanged
  }

  /**
   * @method
   * @description Aggregate data and return progress
   * @returns {number}
   */
  getProgress() {
    if (!this.data.modules) return 0

    const { packages, code, build, run } = this.data.modules

    const modulePackageKeys = Object.keys(packages)

    const totalCount = modulePackageKeys
      .map(k => packages[k].length)
      .reduce((p, c) => c + p)

    if (totalCount === 0) return 0

    const successCount = modulePackageKeys
      .map(k => packages[k].filter(({ state }) => state === 'success').length)
      .reduce((p, c) => c + p)

    return (successCount / totalCount) * 100
  }

  /**
   * @method
   */
  module(name = '') {
    const modulePath = name.length > 0 ? `modules.${name}` : 'modules'
    return reach(this.data, modulePath)
  }
}

module.exports = DeviceStatus

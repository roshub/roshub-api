const debug = require('debug')('roshub.factory.device-info')
const reach = require('../../reach')
const Document = require('../document')
const Identity = require('./identity')

/**
 * @class
 * @alias module:roshub/Types.DeviceInfo
 * @implements {module:roshub.DataParty.Document}
 */
class DeviceInfo extends Document {
  constructor({ party, type, id, data }) {
    super({ party, type, id, data })
    debug('instantiated - ', this.id)
  }
}

module.exports = DeviceInfo
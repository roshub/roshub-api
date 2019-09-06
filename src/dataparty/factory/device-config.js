const reach = require('../../reach')
const debug = require('debug')('roshub.factory.device-config')
const Document = require('../document')

/**
 * @class 
 * @alias module:roshub/Types.DeviceConfig
 * @implements {module:roshub.DataParty.Document}
 */
class DeviceConfig extends Document {
  constructor({party, type, id, data}){
    super({party, type, id, data})
    debug('instantiated - ', this.id)
  }

  /**
   * @method
   */
  async getCodeList() {
    return this.module('code').code || []
  }

  /**
   * @method
   */
  async addCode(codeDocument) {
    debug('addCode')
    const codeActorList = await this.getCodeList()
    codeActorList.push(codeDocument)
    return this.save()
  }

  /**
   * @method
   */
  async updateModule({ packages, build }) {
    this.module().packages = packages
    this.module().build = build

    return this.save()
  }

  /**
   * @method
   */
  module(name=''){
    const modulePath = name.length > 0 ? `modules.${name}` : 'modules'
    return reach(this.data, modulePath)
  }
}

module.exports = DeviceConfig
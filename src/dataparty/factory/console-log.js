const debug = require('debug')('roshub.factory.console-log')
const reach = require('../../reach')
const Document = require('../document')
const Identity = require('./identity')

/**
 * @class 
 * @alias module:roshub/Types.ConsoleLog
 * @implements {module:roshub.DataParty.Document}
 */
class ConsoleLog extends Document {
  constructor({party, type, id, data}){
    super({party, type, id, data})
    debug('instantiated - ', this.id)
  }

  /**
   * @method
   */
  static async create(party, {owner, context, content}){
    let rawDocument = await party.create('console_log', {
      owner, context, content
    })

    return (await party.model.hydrate(rawDocument))[0]
  }
}

module.exports = ConsoleLog
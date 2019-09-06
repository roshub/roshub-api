const debug = require('debug')('roshub.factory.code-status')
const Document = require('../document')

/**
 * @class 
 * @alias module:roshub/Types.CodeStatus
 * @implements {module:roshub.DataParty.Document}
 */
class CodeStatus extends Document {
    constructor({party, type, id, data}){
      super({party, type, id, data})
      debug('instantiated - ', this.id)
    }
}

module.exports = CodeStatus
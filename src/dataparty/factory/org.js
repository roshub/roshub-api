const debug = require('debug')('roshub.factory.org')
const Document = require('../document')

/**
 * @class 
 * @alias module:roshub/Types.Org
 * @implements {module:roshub.DataParty.Document}
 */
class Org extends Document {
    constructor({party, type, id, data}){
      super({party, type, id, data})
      debug('instantiated - ', this.id)
    }

    /**
     * @method
     * @returns {BillingAccount[]}
     */
    async billing(){
      return this.party.find()
        .type('billing_account')
        .where('owner.id').equals(this.id)
        .where('owner.type').equals(this.type)
        .exec()
        .then(docs=>{return docs[0]})
    }

    /**
     * @method
     * @returns {Team[]}
     */
    async teams(){
      return this.party.find()
        .type('team')
        .where('owner.id').equals(this.id)
        .where('owner.type').equals(this.type)
        .exec()
    }
}

module.exports = Org
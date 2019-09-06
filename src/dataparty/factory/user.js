const debug = require('debug')('roshub.factory.user')
const Document = require('../document')
const reach = require('../../reach')

/**
 * @class
 * @alias module:roshub/Types.User
 * @implements {module:roshub.DataParty.Document}
 */
class User extends Document {
  constructor({party, type, id, data}){
    super({party, type, id, data})
    debug('instantiated - ', this.id)
  }

  graph(){
    // map of <Name> to <Query()>
  }

  /**
   * @method
   * @returns {Identity[]}
   */
  async identities(){
    return this.party.find()
      .type('identity')
      .where('owner.id').equals(this.id)
      .where('owner.type').equals(this.type)
      .exec()
  }

  /**
   * @method
   * @returns {BillingAccount}
   */
  async billing(){
    return this.party.find()
      .type('billing_account')
      .where('owner.id').equals(this.id)
      .where('owner.type').equals(this.type)
      .exec()
      .then(docs => docs[0])
  }

  /**
   * @method
   * @returns {Device[]}
   */
  async devices(){
    return this.party.find()
      .type('device')
      .where('owner.id').equals(this.id)
      .where('owner.type').equals(this.type)
      .exec()
  }

  /**
   * @method
   * @returns {Code[]}
   */
  async codes() {
    return this.party.find()
      .type('code')
      .where('owner.id').equals(this.id)
      .where('owner.type').equals(this.type)
      .exec()
  }

  /**
   * @method
   * @returns {Org[]}
   */
  async orgs(){
    return this.party.find()
      .type('org')
      .exec()
  }

  /**
   * @method
   * @returns {Team[]}
   */
  async teams(){
    return this.party.find()
      .type('team')
      .exec()
  }


  async isTutorialDone() {
    return reach(this.data, 'tutorial.done', false)
  }

  async setTutorialDone() {
    await this.mergeData({
      tutorial: {
        done: true
      }
    })

    return this.save()
  }
}

module.exports = User
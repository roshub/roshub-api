const debug = require('debug')('roshub.factory.billing-account')
const Document = require('../document')
const reach = require('../../reach')

/**
 * @class
 * @alias module:roshub/Types.BillingAccount
 * @implements {module:roshub.DataParty.Document}
 */
class BillingAccount extends Document {
  constructor({ party, type, id, data }) {
    super({ party, type, id, data })
    debug('instantiated - ', this.id)
  }

  /**
   * @method
   */
  get hasPlan() {
    return !!reach(this.data, 'subscription.bundle', null)
  }

  /**
   * @method
   */
  get hasAgreedToPrivacy() {
    return !!reach(this.data, 'agreements.privacy.signed', false)
  }

  /**
   * @method
   */
  get hasAgreedToTos() {
    return !!reach(this.data, 'agreements.tos.signed', false)
  }

  /**
   * @method
   */
  get hasAgreedToMarketing() {
    return !!reach(this.data, 'agreements.tos.marketing', false)
  }

  /**
   * @method
   */
  get hasAgreed() {
    return (
      this.hasAgreedToPrivacy && this.hasAgreedToTos
      // this.hasAgreedToMarketing
    )
  }
}

module.exports = BillingAccount

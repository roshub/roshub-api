const DataParty = require('./dataparty/data-party')
const CloudParty = require('./dataparty/cloud-party')
const Types = require('./dataparty/factory')
const Config = require('./config/local-storage')
const BLEPeerClient = require('./comms/ble-socket')

/**
 * @class
 * @alias module:roshub.Api
 * @implements module:roshub.DataParty
 */
class Api extends CloudParty {
  constructor({ uri, wsUri, config }) {
    super({
      config:
        config ||
        new Config({
          cloud: {
            uri: uri || 'https://api.staging.roshub.io',
            wsUri: wsUri || 'wss://ws.staging.roshub.io'
          }
        })
    })
  }

  getBillingPlans(isOrg) {
    return this.rest.call('api-v2-plans')
  }

  async getDeviceLimit() {
    try {
      const { currentPlan } = await this.getBillingPlans()

      const limit =
        currentPlan.name === 'Partner'
          ? 99
          : currentPlan.bundle.device.tiers[0].up_to

      return limit
    } catch (error) {
      return 0
    }
  }

  setBillingPlan(payload) {
    return this.rest.call('api-v2-account_select_plan', payload)
  }

  setLegalAgreements(agreementMap) {
    return this.rest.call('api-v2-account_legal_agreements', agreementMap)
  }

  /**
   * @typedef {Object} AgreementMap
   * @property {Object} marketing
   * @property {Object} privacy
   * @property {Object} tos
   */
  /**
   * @returns {AgreementMap} a map of legal agreements
   */
  getLegalAgreements() {
    return this.rest.call('api-v2-legal')
  }
}

/**
 * @module
 */

module.exports = {
  Api,
  DataParty: DataParty,
  ROSLIB: DataParty.ROSLIB,
  Types,
  /**
   * @class
   * @interface */
  Config,
  Comms: {
    BLEPeerClient
  }
}

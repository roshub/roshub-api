const DataParty = require('./dataparty/data-party')
const CloudParty = require('./dataparty/cloud-party')
const Types = require('./dataparty/factory')
const Config = require('./config/nconf')
const Api = require('./roshub').Api

const BLEPeerClient = require('./comms/ble-socket')

class NodeApi extends Api {
  constructor({uri, wsUri, config}){
    super({
      config: config || new Config({
        cloud: {
          uri: uri || 'https://api.staging.roshub.io',
          wsUri: wsUri || 'wss://ws.staging.roshub.io'
        }
      })
    })
  }
}


module.exports = {
  Api: NodeApi,
  DataParty: DataParty,
  ROSLIB: DataParty.ROSLIB,
  Types,
  Config,
  Comms: {
    BLEPeerClient
  }
}
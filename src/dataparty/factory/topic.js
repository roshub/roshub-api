const debug = require('debug')('roshub.factory.topic')
const Document = require('../document')

/**
 * @class
 * @alias module:roshub/Types.Topic
 * @implements {module:roshub.DataParty.Document}
 */
class Topic extends Document {
  constructor({party, type, id, data}){
    super({party, type, id, data})
    debug('instantiated - ', this.id)
  }

  /**
   * Get a connected instance of ROSLIB.Topic
   * @method
   * @param {object} option ROSLIB.Topic options
   */
  async instance(option) {
    const ws = await this.party.websocket()

    const ros = ws.ros()

    const name = `/${this.owner.type}/${this.owner.id}/${this.data.topicName}`
    const { ROSLIB } = this.party
    
    return new ROSLIB.Topic({
        ros,
        name ,
        messageType: this.data.messageType,
        ...option
    })

  }

  /**
   * @method
   * @param {DataParty} party
   * @param {object}    option
   */
  static async create(party, option){
    debug('creating topic', option)

    if(!party || !party.hasActor()) {
      throw new Error('party is over :(')
    }

    const obj = {
      owner: {
        id: party.actor.id,
        type: party.actor.type
      },
      ...option
    }

    const rawDoc = await party.create('topic', obj)

    const topic = (await party.model.hydrate(rawDoc))[0]
    
    return topic
  }
  
}

module.exports = Topic
const debug = require('debug')('roshub.factory.identity')
const Document = require('../document')

/**
 * @class 
 * @alias module:roshub/Types.Identity
 * @implements {module:roshub.DataParty.Document}
 */
class Identity extends Document {
  constructor({party, type, id, data}){
    super({party, type, id, data})
    debug('instantiated - ', this.id)
  }

  async hasIdentity(key){
    return this.party.find()
      .type('identity')
      .where('key.public.box').equals(key.public.box)
      .where('key.public.sign').equals(key.public.sign)
      .where('key.type').equals(key.type)
      .exec()
  }

  static async create(party, owner, key){

    debug('creating identiy ', owner, key)

    let identity = party.find()
      .type('identity')
      .where('owner.id').equals(owner.id)
      .where('owner.type').equals(owner.type)
      .where('key.public.box').equals(key.public.box)
      .where('key.public.sign').equals(key.public.sign)
      .where('key.type').equals(key.type)
      .exec()

    if(identity && identity.length == 1){ 
      debug('found identity');
      debug(identity[0]);
      return identity[0]
    }

    if(!party || !party.hasActor()){
      return Promise.reject('you call that a party?')
    }
     
    let obj = {
      owner: {
        id: owner.id,
        type: owner.type
      },
      key: key,
      enabled: true
    }

    let rawDoc = await party.create('identity', obj)

    identity = (await party.model.hydrate(rawDoc))[0]

    return identity
  }
  
}

module.exports = Identity
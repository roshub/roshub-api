const debug = require('debug')('roshub.dataparty.cloudparty')

const Rest = require('../comms/rest')
const DataParty = require('./data-party')
const roshub_crypto = require('@dataparty/crypto')

/**
 * @class
 * @implements module:roshub.DataParty
 */
class CloudParty extends DataParty {

  constructor({config}){
    super({ config: config })

    this._actor = {id: undefined, type: undefined}
    this._actors = []
    this._identity = undefined
    
    //if(uri[uri.length-1] != '/'){ uri = uri+'/' }

    this.rest = new Rest({config: this.config, party: this})
  }

  /**
   * @method
   */
  hasIdentity(){
    return this._identity != undefined
  }

  /**
   * @method
   */
  hasActor(){
    return this.actor != undefined
  }

  /**
   * @type {module:roshub/Types.Identity}
   */
  get identity(){
    if (!this.hasIdentity()){ return undefined }
    return this._identity.toJSON(false)
  }

  /** @type {IdObj} */
  get actor(){
    if (this.actors && this.actors[0]){

      return this.actors[0]

    } else if (this._actor.id && this._actor.type){

      return this._actor

    }

    return undefined
  }

  /** @type {IdObj[]} */
  get actors(){
    return this._actors
  }

  set actors(value){
    this._actors = value

    const primaryActor = this.actor

    if (!primaryActor){
     return
    }

    this._actor.id = primaryActor.id
    this._actor.type = primaryActor.type

    const path = 'actor'
    this.config.write(path, this._actor)
  }

  /**
   * @method
   */
  async encrypt(data, to){
    const msg = new roshub_crypto.Message({msg: data})
    await msg.encrypt(this._identity, to.key)

    return msg
  }

  /**
   * @method
   */
  async decrypt(reply, expectedSender, expectClearTextReply = false){
    // if reply has ciphertext & sig attempt to decrypt
    if (reply.enc && reply.sig) {
      const msg = new roshub_crypto.Message(reply)

      const replyContent = await msg.decrypt(this._identity)

      const publicKeys = roshub_crypto.Routines.extractPublicKeys(msg.enc)

      debug(`publicKeys.sign - ${publicKeys.sign}`)

      if (publicKeys.sign !== expectedSender.key.public.sign ||
          publicKeys.box !== expectedSender.key.public.box) {
        throw new Error('TrustFail: reply is not from service')
      }

      debug('decrypted reply ->', JSON.stringify(replyContent))

      if (replyContent.error) {
        debug('call failed ->', replyContent.error)
        throw replyContent.error
      }

      return replyContent

    } else if (expectClearTextReply && !reply.error) {

      return reply

    }

    if (reply.error) {
      debug('call failed ->', reply.error)
      throw reply.error
    }

    throw new Error('TrustFail: reply is not encrypted')
  }

  /**
   * @method
   */
  async call(msg){
    return this.rest.call('api-v2-bouncer', msg)
  }

  /**
   * @method
   */
  async socket(){
    return this.rest.websocket()
  }

  /**
   * @method
   */
  async start(){
    debug('start')
    await super.start()
    await Promise.all([
      this.loadIdentity(),
      this.loadActor(),
    ])

    await this.rest.start()
  }

  async stop(){
    await this.rest.stop()
  }

  /**
   * @method
   */
  async loadIdentity(){
    const path = 'identity'
    const cfgIdenStr = this.config.read(path)

    if (!cfgIdenStr){
      debug('generated new identity')
      this._identity = new roshub_crypto.Identity({id: 'primary'})
      await this.config.write(path, this._identity.toJSON(true))
    } else {
      debug('loaded identity')
      this._identity = roshub_crypto.Identity.fromString(JSON.stringify(cfgIdenStr))
    }
  }

  async resetIdentity(){
    const path = 'identity'
    await this.config.write(path, null)
    await this.loadIdentity()
  }

  /**
   * @method
   */
  async loadActor(){
    const path = 'actor'
    const localActorObj = this.config.read(path)

    if (!localActorObj){ return }

    this._actor.id = localActorObj.id
    this._actor.type = localActorObj.type

    debug('loaded actor', this._actor)
  }
}

module.exports = CloudParty

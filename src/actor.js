const debug = require('debug')('roshub.api')
const roshub_crypto = require('@dataparty/crypto')

class Actor {
    constructor({identity, type, id}){
        this.type = type
        this.id = id
        this.identity = identity
        //this._data = {}

        this.actors = []
        //this._billingAccount = undefined
    }

    addActors(actors){
        this.actors = actors
    }

    /*get data(){
        return this._data
    }

    set data(value){
        this._data = value
    }*/

    encrypt(data, to){
        let message = new roshub_crypto.Message({msg: data})
        return message.encrypt(this.identity, to.key)
    }

    decrypt(reply, sender){
        const replyObj = JSON.parse(reply.data)
        let dataPromise = new Promise((resolve, reject)=>{
            if(replyObj.enc && replyObj.sig){
              let msg = new roshub_crypto.Message(replyObj)
      
              return resolve(msg.decrypt(this.identity).then(content=>{
                const senderPub = JSON.parse(msg.enc).sender.public
                debug(`senderPub - ${senderPub}`)
      
                if(senderPub != sender.key.public.toString('base64')){
                  return Promise.reject('TRUST - reply is not from service')
                }

                debug('decrypted data')
                return content
              }))
            }
      
            reject( Promise.reject('TRUST - reply is not encrypted') )
          })
      
        return dataPromise
    }
}

module.exports = Actor

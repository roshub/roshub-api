const debug = require('debug')('roshub.factory.acl')
const Document = require('../document')


/**
 * Access Control List
 * @class 
 * @alias module:roshub/Types.Acl
 * @implements  {module:roshub.DataParty.Document}
 * @param {object}    options
 * @param {DataParty} options.party
 * @param {string}    options.id
 * @param {string}    options.type
 * @param {object}    options.data
 */
class Acl extends Document {
  constructor({party, type, id, data}){
    super({party, type, id, data})
    debug('instantiated - ', this.id)
  }
  
  /**
   * Retrieve the resource protected by this Acl
   * @method
   * @returns {module:roshub.DataParty.Document}
   */
  async resource(){
    return this.party.find()
      .type(this.data.resource.type)
      .id(this.data.resource.id)
      .exec()
      .then(docs=>{
        debug('hook', docs)
        return docs
      })
      .then(this.party.model.hydrate.bind(this.party.model))
      .then(docs=>{
        return docs[0]
      })
  }


  static filterByAclActor (actions, {id, type}) {
    return actions.filter(({actor})=> actor.id=== id && actor.type === type)
  }

  /**
   * @method
   * @param {string} action 
   * @param {IdObj} actor 
   * @param {string} field
   * @param {boolean} allowed 
   */
  async setPermissionsByField(action, actor, field = '', allowed = true){

    const filteredPermissions = this.data.permissions.filter((perm)=> perm.field === field)

    if(filteredPermissions.length > 0) {
      let actorExist = false;
      filteredPermissions[0].actions[action].forEach(aclObject => {
        if(aclObject.actor.id === actor.id && aclObject.actor.type === actor.type) {
          aclObject.allowed = allowed
          actorExist = true;
        }
      });

      // Insert if not exist
      if(!actorExist) {
        filteredPermissions[0].actions[action].push({
          actor: {
            id: actor.id,
            type: actor.type
          },
          allowed
        })
      }
    } else {
      this.data.permissions.push({
        field,
        actions: {
          [action] : [{
            actor: {
              id: actor.id,
              type: actor.type
            },
            allowed
          }]
        }
      })
    }

    debug(this.data)
    this.save()
  }

  /**
   * @method
   * @param {string} action 
   * @param {string} field 
   */
  getPermissionsByField(action, field){
    for(let perms of this.data.permissions){

      if(!perms.actions[action]){ continue }
  
      if((!perms.field && !field) || perms.field == field){
        return perms
      }
    }
  
    return undefined
  }

  async isAllowed(actor, action, field){
    //
  }

  static async isOwner(party, document, actor){
    //
  }

  static async isMember(party, document, field, actor){
    //
  }

  static async aclByResource(id, type){
    //
  }

  static async aclResourcesByActors(party, actors, type, action, field){
    //
  }
}

module.exports = Acl
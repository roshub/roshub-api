const Ajv = require('ajv')
const debug = require('debug')('roshub.dataparty.model')
const RosHubApiSchema = require('@roshub/service-model/dist/roshub-model.json')
const RosHubFactory = require('./factory')
const Document = require('./document')

/**
 * @class
 */
class DataModel {
  constructor({schemas, factories, party}){
    this.factories = factories || RosHubFactory
    this.party = party
    this.ajv = new Ajv()
    this.jsonSchemeArr = schemas || RosHubApiSchema.Api
    this.validators = {}

    for(let schema of this.jsonSchemeArr){
      const v = this.ajv.compile(schema)
      this.validators[schema.title] = v
      debug(schema.title)
    }
  }

  /**
   * 
   * @param {*} found 
   */
  async hydrate(found){
    let documents = []
    for(let doc of found){
      let id = doc.$meta.id
      let type = doc.$meta.type
      let document = this.getDocument(type, id, doc)

      documents.push(document)
    }

    return documents
  }


  /**
   * 
   * @param {*} type 
   * @param {*} factory 
   */
  addFactory(type, factory){
    this.factories[type] = factory
  }

  /**
   * 
   * @param {*} type 
   */
  getFactory(type){
    if(this.factories && this.factories[type]){
      return this.factories[type]
    }

    return Document
  }

  /**
   * @method
   */
  getTypes(){
    let types = ['document']
    return types.concat(Object.keys(this.factories))
  }


  /**
   * @method
   */
  getFactories(){
    let factories = { document: Document }

    for(let name of this.getTypes()){
      factories[name] = this.getFactory(name)
    }

    return factories
  }

  /**
   * 
   * @param {*} type 
   * @param {*} id 
   * @param {*} data 
   */
  getDocument(type, id, data){
    let TypeFactory = this.getFactory(type)
    let instance = new TypeFactory({type, id, data, party: this.party})

    return instance
  }


  /**
   * 
   * @param {*} type 
   * @param {*} data 
   */
  validate(type, data){
    return new Promise((resolve, reject)=>{

      if(!this.validators[type]){
        debug('WARNING - validate with no such model type[', type, ']')
        return resolve(data)
      }

      let valid = this.validators[type](data)

      if(!valid){
        let errors = this.validators[type].errors
        return reject({error: errors})
      }

      return resolve(data)
    })
  }
}

module.exports = DataModel

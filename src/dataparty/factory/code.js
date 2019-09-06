const parseUrl = require('parse-url')

const debug = require('debug')('roshub.factory.code')
const Document = require('../document')

/**
 * @class
 * @alias module:roshub/Types.Code
 * @implements {module:roshub.DataParty.Document}
 */
class Code extends Document {
  constructor({ party, type, id, data }) {
    super({ party, type, id, data })
    debug('instantiated - ', this.id)
  }

  async status() {
    return this.party
      .find()
      .type('code_status')
      .where('code.id')
      .equals(this.id)
      .exec()
      .then(docs => docs[0])
  }

  async deployKey() {
    return this.party
      .find()
      .type('deploy_key')
      .where('code.id')
      .equals(this.id)
      .exec()
      .then(docs => docs[0])
  }

  async createDeployKey(key) {
    await this.party.rest.call('api-v2-add-repo-deploy-key-github', {
      code: this.id,
      key: key
    })
  }

  async getCloudInfo() {
    return this.party.rest.call('api-v2-repo-info-github', {
      owner: this.data.cloud.owner,
      repo: this.data.cloud.repo
    })
  }

  /**
   * @method
   */
  async addToDevice(device) {
    debug('add to device')
    const [deviceConfig] = await Promise.all([
      this.party
        .find()
        .type('device_config')
        .id(device.data.config.id)
        .exec()
        .then(d => d[0]),
      this.grantAccess('read', device.idObj),
      (async () => {
        const status = await this.status()
        debug('allowing access to code-status', status)

        const statusAcl = await status.acl()
        debug('status acl', statusAcl)
        return status.grantAccess('read', device.idObj)
      })()
    ])

    return deviceConfig.addCode(this.idObj)
  }

  /**
   * @method
   */
  static async create(party, argv) {
    if (!party || !party.hasActor()) {
      throw new Error('party is over :(')
    }
    let owner, repo, gitHost

    if (typeof argv === 'string') {
      const remote = parseUrl(argv)

      owner = remote.pathname.split('/')[1]
      repo = remote.pathname.split('/')[2].replace('.git', '')
      gitHost = remote.resource
    } else if (argv.owner && argv.repo && argv.gitHost) {
      owner = argv.owner
      repo = argv.repo
      gitHost = argv.gitHost
    } else {
      throw new Error('bad arguments')
    }

    if (gitHost !== 'github.com') {
      throw new Error('unsupported host[' + gitHost + ']')
    }

    const githubRepo = {
      owner,
      repo
    }

    const reply = await party.rest.call('api-v2-add-repo-github', githubRepo)

    const code = (await party.model.hydrate([reply.code]))[0]

    if (argv.update) {
      code.data.update = argv.update
      await code.save()
    }

    return code
  }
}

module.exports = Code
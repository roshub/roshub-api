const debug = require("debug")("roshub.factory.device");
const reach = require("../../reach");
const Document = require("../document");
const Identity = require("./identity");

/**
 * @class 
 * @alias module:roshub/Types.Device
 * @implements {module:roshub.DataParty.Document}
 */
class Device extends Document {
  constructor({ party, type, id, data }) {
    super({ party, type, id, data });
    debug("instantiated - ", this.id);

    this.bleDevice = undefined
    this.statusDoc = undefined
  }

  /**
   * @method
   */
  async identities() {
    return this.party
      .find()
      .type("identity")
      .where("owner.id")
      .equals(this.id)
      .where("owner.type")
      .equals(this.type)
      .exec();
  }

  /**
   * @method
   */
  async hasIdentity(key) {
    return this.party
      .find()
      .type("identity")
      .where("owner.id")
      .equals(this.id)
      .where("owner.type")
      .equals(this.type)
      .where("key.public.box")
      .equals(key.public.box)
      .where("key.public.sign")
      .equals(key.public.sign)
      .where("key.type")
      .equals(key.type)
      .exec();
  }

  /**
   * @method
   */
  async addIdentity(identityKey) {
    let foundIdentity = await this.hasIdentity(identityKey);
    debug("has identity = ", foundIdentity, identityKey);

    if (foundIdentity && foundIdentity.length == 1) {
      debug("found identity", foundIdentity);
      return foundIdentity[0];
    }

    let identity = await Identity.create(this.party, this, identityKey);
    debug("created identity", identity);
    return identity;
  }

  /**
   * @method
   */
  async unenroll() {
    return this.bleRun({ op: "unenroll" });
  }

  /**
   * @method
   */
  async attachBlePeer(bleDevice){
    this.bleDevice = bleDevice
    return this.bleDevice.start()
  }

  /**
   * @method
   */
  async enroll() {
    const identityBle = await this.bleRun({ op: "identity" });

    await this.addIdentity(identityBle.key);
    
    const enrollResult = await this.bleRun({
      op: "enroll",
      actor: {
        id: this.id,
        type: this.type
      },
      owner: {
        id: this.owner.id,
        type: this.owner.type
      },
      cloud: {
        uri: this.party.config.read('cloud.uri'),
        wsUri: this.party.config.read('cloud.wsUri')
      }
    })

    return enrollResult;
  }

  /**
   * @method
   */
  async bleRun(argv) {
    if (!this.bleDevice) throw new Error('No blePeer Attached!')

    const result = await this.bleDevice.run(argv)
    debug(result)
    return result[result.op] ? {
      op: result.op,
      ...result[result.op]
    }
      : result
  }

  /**
   * @method
   */
  async wifiConnect(ssid, password) {
    const wifiConnect = await this.bleRun({
      op: "wifi-connect",
      ap: {
        ssid,
        password
      }
    });

    const wifiState = await this.wifiState()
    return { 
      wifiConnect, 
      wifiState
    };
  }

  /**
   * @method
   */
  async wifiState() {
    return this.bleRun({ op: "wifi-state" })
  }

  /**
   * @method
   */
  async wifiScan() {
    const wifiScan = await this.bleRun({ op: "wifi-scan" })
    const wifiState = await this.wifiState()
    
    return { 
      wifiScan, 
      wifiState
    };
  }

  /**
   * @method
   * @returns {DeviceConfig}
   */
  async config() {
    return (await this.party
      .find()
      .type("device_config")
      .id(this.data.config.id)
      .exec()
    )[0];
  }

  /**
   * @method
   * @returns {DeviceStatus}
   */
  async status() {
    return (this.statusDoc = (await this.party
      .find()
      .type("device_status")
      .owner(this.type, this.id)
      .exec()
    )[0])
  }

  /**
   * @method
   * @returns {DeviceInfo}
   */
  async info() {
    return (await this.party
      .find()
      .type("device_info")
      .owner(this.type, this.id)
      .exec()
    )[0];
  }


  /**
   * @method
   * @todo Move to {DeviceConfig}
   */
  async getCodeDocumentList() {
    const config = await this.config()

    const codeList = await config.getCodeList()

    try {
      return (await Promise.all(
        codeList.map(({ id, type }) =>
          this.party
            .find()
            .type(type)
            .id(id)
            .exec()
        )
      )).map(d => d[0])
    } catch (e) {
      debug(e)
    }

    return []
  }

  /**
   * @method
   * @todo Move to {DeviceConfig}
   */
  async removeCode(index) {
    const config = await this.config()
    const codeActorList = await config.getCodeList()

    codeActorList.splice(index, 1)

    return config.save()
  }

  /**
   * @method
   * @todo implement a topic factory that create a socket connect
   */
  async topics() {
    return this.party
      .find()
      .type("topic")
      .owner(this.type, this.id)
      .exec();
  }

  /**
   * @method
   */
  async topic(topicName) {
    const existingTopicList = await this.party
      .find()
      .type("topic")
      .owner(this.type, this.id)
      .where("topicName")
      .equals(topicName)
      .exec();

    if (!existingTopicList || existingTopicList.length === 0) {
      throw new Error("topic not found");
    }

    debug('found topic', existingTopicList[0]);

    return existingTopicList[0];
  }

  /**
   * @method
   */
  static async create(party, name) {
    debug("creating device ", name);

    const existingDeviceList = await party
      .find()
      .type("device")
      .where("name")
      .equals(name)
      .exec();

    if (existingDeviceList && existingDeviceList.length > 0) {
      debug("found device");
      debug(existingDeviceList[0]);
      return existingDeviceList[0];
    }

    if (!party || !party.hasActor()) {
      return Promise.reject(new Error('you call that a party?'))
    }

    const owner = party.actor.idObj

    const [rawDevice, rawDeviceConfig] = await Promise.all([
      party.create("device", {
        name,
        owner
      }),
      party.create("device_config", {
        owner
      })
    ])

    const [newDevice, newDeviceConfig] = (await Promise.all([
      party.model.hydrate(rawDevice),
      party.model.hydrate(rawDeviceConfig)
    ])).map(docList => docList[0])

    debug("newDeviceConfig", newDeviceConfig)

    newDevice.data.config = newDeviceConfig.idObj

    const deviceActor = newDevice.idObj

    await Promise.all([
      newDevice.save(),
      newDeviceConfig.grantAccess('read', deviceActor),
      party.create('device_status', { owner: deviceActor })
    ])

    return newDevice
  }
}

module.exports = Device;

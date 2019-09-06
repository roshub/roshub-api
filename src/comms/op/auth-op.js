const debug = require('debug')('roshub.op.auth-op')
const SocketOp = require('./socket-op')


class AuthOp extends SocketOp {
    constructor(socket){
        super('auth', {}, socket)
    }
}

module.exports = AuthOp
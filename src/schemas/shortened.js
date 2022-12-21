let m = require('mongoose')
let sch = new m.Schema({
    key: String,
    redirect_uri: String,
    ip_address: String
},
    {
        timestamps: true,
    })
sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('shortened', sch);
let m = require('mongoose')
let Schema = m.Schema;
let sch = new m.Schema({
    key: String,
    redirect_uri: String,
    ip_address: String,
    click: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, autopopulate: {}, ref: 'user' }
},
    {
        timestamps: true,
    })
sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('short', sch);
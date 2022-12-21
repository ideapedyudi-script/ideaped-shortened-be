let m = require('mongoose')
let sch = new m.Schema({
    username: String,
    email: {
        type: String,
        required: true,
        match: /.+\@.+\..+/,
        unique: true
    },
    password: String,
    level: Number
})

sch.index({ username: 1, email: 1 })
sch.plugin(require('mongoose-autopopulate'))

module.exports = m.model('user', sch);
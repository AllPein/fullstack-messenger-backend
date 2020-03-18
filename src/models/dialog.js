const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const dialogSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    partner: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    lastMessage:{
        type: Schema.Types.ObjectId,
        ref: "message",
        required: false
    },
    count: {
        type: Schema.Types.Mixed,
        required: false,
    }
});

const Dialog = mongoose.model('dialog', dialogSchema);

module.exports = Dialog;
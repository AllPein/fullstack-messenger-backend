const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const messageSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    dialogId: {
        type: Schema.Types.ObjectId,
        ref: "dialog",
        required: true
    },
    text:{
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    isRead: {
        type: Boolean,
        required: true
    }
    
});

const Message = mongoose.model('message', messageSchema);

module.exports =  Message;
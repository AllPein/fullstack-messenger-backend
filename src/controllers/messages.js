const Dialog = require("../models/dialog");
const Message = require("../models/message");

class MessageController {
    constructor(io) {
        this.io = io;
    }

    init(req, res) {
        const dialogId = req.params.id;


        Message.find({ dialogId })
        .populate({path: 'user', select: ['_id', 'username', 'avatarColor']})
        .exec((err, messages) => {
            if (err) {
                return res.status(404).json({
                  status: 'error',
                  message: 'Messages not found',
                });
            }
            return res.json(messages);
        })
    } 
}

module.exports = MessageController;
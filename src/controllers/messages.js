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
    
    async create(req, res) {
        try {
            const dialogId = req.params.id;
            const data = {
                text: req.body.text,
                time: req.body.time,
                user: req.body.userId,
                dialogId: dialogId
            }
            
            let message = new Message(data);

            let messageData = await message.save();

            const response = await Message.findOne({ _id: messageData._id }).populate({path: 'user', select: ['_id', 'username', 'avatarColor']});

            await Dialog.findOneAndUpdate({ _id: dialogId }, {lastMessage: messageData._id}, { upsert: true }, (err) => {
                if (err) if (err) return res.status(500).json({error: err});
                res.json(response);
                this.io.emit("MESSAGES:NEW_MESSAGE", response);
            })
        }
        catch(err){
            if (err) return res.status(500).json({error: err});
        }
    }
}

module.exports = MessageController;
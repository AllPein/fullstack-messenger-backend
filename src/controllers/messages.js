const Dialog = require("../models/dialog");
const Message = require("../models/message");

class MessageController {
    constructor(io) {
        this.io = io;
    }


    updateIsRead({ userId, dialogId }){
        Message.updateMany({ dialogId: dialogId, user: { $ne: userId } },
            { $set: { isRead: true } }, 
            async (err) => {
                const dialog = await Dialog.findById(dialogId);
                dialog.count[userId] = 0;
                dialog.markModified('count');
                dialog.save();
                await this.io.emit("MESSAGES:UPDATE_IS_READ", {userId, dialogId});
                
            }
        )
    }

    init(req, res) {
        const dialogId = req.params.dialogId;
        const userId = req.params.userId;
        
        Message.find({ dialogId })
        .populate({path: 'user', select: ['_id', 'username', 'avatarColor']})
        .exec(async (err, messages) => {
            if (err) {
                return res.status(404).json({
                  status: 'error',
                  message: 'Messages not found',
                });
            }

            this.updateIsRead({ userId, dialogId});

            

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
                dialogId: dialogId,
                isRead: false
            }
            
            let message = new Message(data);
            let messageData = await message.save();
            const response = await Message.findOne({ _id: messageData._id }).populate({path: 'user', select: ['_id', 'username', 'avatarColor']});

            const dialog = await Dialog.findById(dialogId);

            let id = dialog.get("author") == req.body.userId ? dialog.get("partner") : dialog.get("author");
            let count = dialog.count;
            count[id] += 1;

            await Dialog.findOneAndUpdate({ _id: dialogId }, {lastMessage: messageData._id, count} , { upsert: true },  (err) => {
                if (err) if (err) return res.status(500).json({error: err});
                res.json(response);
                this.io.emit("MESSAGES:NEW_MESSAGE", response);
            })
        }
        catch(err){
            if (err) return res.status(500).json({error: err});
        }
    }

    delete(req, res) {
        try {
            const messageId  = req.params.id;
            Message.findById(messageId, async (err, message) => {
                if (err) return res.status(400).json({error: err});

                let dialogId = message.dialogId;
                message.remove()
                .then(() => {
                    Message.findOne({ dialogId }, {}, { sort: { time: -1 } }, (error, lastMessage) => {
                        if (err) return res.status(400).json({error: error});
                        if (lastMessage === null) {
                            Dialog.findByIdAndDelete(dialogId, (err, dialog) => {
                                if (err) return res.status(400).json({error: err});

                                this.io.emit("DIALOGS:DIALOG_DELETED", {dialogId});
                                return res.json(dialog);
                            })
                        }
                        else {
                            Dialog.findById(dialogId, (err, dialog) => {
                                if (err) return res.status(400).json({error: err});
                                dialog.lastMessage = lastMessage;
                                dialog.save();

                                this.io.emit("MESSAGES:MESSAGE_DELETED", {dialogId});
                            })
                        }
                        
    
                    });
                });

                

            })
        }
        catch(err){

        }
    }
}

module.exports = MessageController;
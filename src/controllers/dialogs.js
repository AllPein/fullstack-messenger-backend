const Dialog = require("../models/dialog");
const Message = require("../models/message");

class DialogController {
    constructor(io) {
        this.io = io;
    }

    init(req, res) {
        const userId = req.params.id;

        Dialog.find().or([{ author: userId }, { partner: userId }])
        .populate({path: 'author', select: ['_id', 'username', 'avatarColor', 'lastSeen', 'isOnline']})
        .populate({path: 'partner', select: ['_id', 'username', 'avatarColor', 'lastSeen', 'isOnline']})
        .populate({path: 'lastMessage', select: ['_id', 'text', 'user', 'time', 'isRead'], populate: {
            path: 'user',
            select: ["_id"]
        }})
        .exec((err, dialogs) => {
            if (err) return res.status(404).json(err);

            return res.json(dialogs.sort((a, b) => a.lastMessage.time - b.lastMessage.time).reverse());
        });
    }

    async create(req, res)  {

        const data = {
            author: req.body.userId,
            partner: req.body.partnerId
        }

        Dialog.findOne({
            $and : [
                { $or : [ { author : data.author}, { partner : data.author } ] },
                { $or : [ { author : data.partner }, { partner : data.partner } ] }
            ]
        }, async (err, response) => {
            if (err) return res.status(500).json({error: "Error"});
            if (response) return res.status(400).json({error: 'Dialog with such id already exists'});

            else {
                    const dialog = new Dialog(data);
                    dialog.count = {};
                    dialog.count[data.author] = 0;
                    dialog.count[data.partner] = 1;
                    let dialogData = await dialog.save();

                    let message = new Message({
                        user: data.author,
                        dialogId: dialogData._id,
                        text: req.body.text,
                        time: req.body.time,
                        count: {

                        },
                        isRead: false
                    })

                    let messageData = await message.save();

                    dialogData.lastMessage =  await messageData._id;
                    await dialogData.save();

                    await res.json(dialogData);
                    await this.io.emit("DIALOGS:DIALOG_CREATED", dialogData);
                
                
            }
        })


    }
}

module.exports = DialogController;
const UserController = require("../controllers/users");
const MessagesController = require("../controllers/messages");


createSocket = (server) => {
    
  let io = require('socket.io')(server);

  let MC = new MessagesController(io);


  io.on('connection', function(socket) {
    const uid = socket.handshake.query.id;
    UserController.setLastSeen({userId: uid, lastSeen: new Date(), isOnline: true});
    
    socket.on('MESSAGES:UPDATE_READ', ({ dialogId, userId }) => {
      MC.updateIsRead({ userId, dialogId });
    });

    socket.on('DIALOGS:JOIN', (dialogId) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });

    socket.on('DIALOGS:TYPING', ({dialogId, uid}) => {
      socket.broadcast.emit("DIALOGS:IS_TYPING", {dialogId, uid});
    });
    socket.on('disconnect', () => {
      UserController.setLastSeen({userId: uid, lastSeen: new Date(), isOnline: false});
    })
  });

  return io;
};

module.exports = createSocket;
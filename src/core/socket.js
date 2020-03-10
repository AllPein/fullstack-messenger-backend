const UserController = require("../controllers/users");

createSocket = (server) => {
    
  let io = require('socket.io')(server);

  io.on('connection', function(socket) {
    const uid = socket.handshake.query.id;
    UserController.setLastSeen({userId: uid, lastSeen: new Date(), isOnline: true});
    

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
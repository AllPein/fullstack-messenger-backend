createSocket = (server) => {
    
  let io = require('socket.io')(server);

  io.on('connection', function(socket) {
    socket.on('DIALOGS:JOIN', (dialogId) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });
    
  });

  return io;
};

module.exports = createSocket;
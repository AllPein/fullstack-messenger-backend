createSocket = (server) => {
    
  var io = require('socket.io')(server);

  io.on('connection', function(socket) {
    socket.on('DIALOGS:JOIN', (dialogId) => {
      socket.dialogId = dialogId;
      socket.join(dialogId);
    });
    socket.on('DIALOGS:TYPING', (obj) => {
      socket.broadcast.emit('DIALOGS:TYPING', obj);
    });
  });

  return io;
};

module.exports = createSocket;
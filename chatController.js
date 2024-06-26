let unsubscribeChatListener = null;

function sendMessage(gameId, playerName, message) {
  return db.collection('games').doc(gameId).collection('messages').add({
    playerName,
    message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .catch(error => {
    console.error("Error sending message: ", error);
    alert("Error al enviar el mensaje. Por favor, intenta de nuevo.");
  });
}

function listenToMessages(gameId) {
  if (unsubscribeChatListener) {
    unsubscribeChatListener();
  }

  unsubscribeChatListener = db.collection('games').doc(gameId).collection('messages')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .onSnapshot(
      snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            displayMessage(change.doc.data());
          }
        });
      },
      error => {
        console.error("Error listening to messages: ", error);
        alert("Error al cargar los mensajes. Por favor, recarga la página.");
      }
    );
}

function stopListeningToMessages() {
  if (unsubscribeChatListener) {
    unsubscribeChatListener();
    unsubscribeChatListener = null;
  }
}

function displayMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  const messageElement = document.createElement('div');
  messageElement.textContent = `${message.playerName}: ${message.message}`;
  chatMessages.appendChild(messageElement);
}
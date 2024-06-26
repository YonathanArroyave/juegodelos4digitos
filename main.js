let currentGameId;
let currentPlayerName;
let currentPlayerIndex;

function createOrJoinGame() {
  const playerName = document.getElementById('playerName').value;
  if (!playerName) {
    alert('Por favor, ingresa tu nombre');
    return;
  }
  
  currentPlayerName = playerName;
  
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('gameId');
  
  if (gameId) {
    joinGame(gameId, playerName)
      .then(() => {
        currentGameId = gameId;
        currentPlayerIndex = 1;
        startGame();
      })
      .catch(error => {
        console.error("Error joining game: ", error);
        alert("Error al unirse al juego. Por favor, intenta de nuevo.");
      });
  } else {
    createGame(playerName)
      .then(newGameId => {
        currentGameId = newGameId;
        currentPlayerIndex = 0;
        window.history.replaceState(null, '', `?gameId=${newGameId}`);
        startGame();
      })
      .catch(error => {
        console.error("Error creating game: ", error);
        alert("Error al crear el juego. Por favor, intenta de nuevo.");
      });
  }
}

function startGame() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('gameRoom').style.display = 'block';
  listenToGameChanges(currentGameId);
  listenToMessages(currentGameId);
}

function makeGuess() {
  const guessInput = document.getElementById('guessInput');
  const guess = guessInput.value;
  
  if (!validateNumber(guess)) {
    alert('Por favor, ingresa un número válido de 4 dígitos');
    return;
  }
  
  makeGuess(currentGameId, currentPlayerIndex, guess)
    .then(() => {
      guessInput.value = '';
      return checkGameOver(currentGameId);
    })
    .catch(error => {
      console.error("Error making guess: ", error);
      alert("Error al realizar el intento. Por favor, intenta de nuevo.");
    });
}

function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (message) {
    sendMessage(currentGameId, currentPlayerName, message)
      .then(() => {
        chatInput.value = '';
      })
      .catch(error => {
        console.error("Error sending message: ", error);
        alert("Error al enviar el mensaje. Por favor, intenta de nuevo.");
      });
  }
}

function endGame() {
  stopListeningToGameChanges();
  stopListeningToMessages();
  // Aquí puedes añadir lógica adicional para finalizar el juego, como mostrar resultados finales
}

window.addEventListener('beforeunload', () => {
  if (currentGameId && currentPlayerIndex !== undefined) {
    handleDisconnect(currentGameId, currentPlayerIndex)
      .catch(error => console.error("Error handling disconnect: ", error));
  }
});

// Inicializar la autenticación al cargar la página
auth.onAuthStateChanged((user) => {
  if (user) {
    showGameContainer();
  } else {
    showAuthContainer();
  }
});
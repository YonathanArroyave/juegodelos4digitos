let unsubscribeGameListener = null;

function updateUI(game) {
  document.getElementById('gameId').textContent = game.id;
  
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = '';
  game.players.forEach((player, index) => {
    const playerDiv = document.createElement('div');
    playerDiv.textContent = `Jugador ${index + 1}: ${player.name} ${player.isReady ? '(Listo)' : ''}`;
    playersDiv.appendChild(playerDiv);
  });
  
  const gameArea = document.getElementById('gameArea');
  gameArea.style.display = game.players.every(p => p.isReady) ? 'block' : 'none';
  
  const guessHistory = document.getElementById('guessHistory');
  guessHistory.innerHTML = '';
  game.players.forEach((player, index) => {
    if (player.guesses) {
      player.guesses.forEach(guess => {
        const guessDiv = document.createElement('div');
        guessDiv.textContent = `Jugador ${index + 1}: ${guess.guess} - Posición correcta: ${guess.result.correctPosition}, Dígito correcto: ${guess.result.correctDigit}`;
        guessHistory.appendChild(guessDiv);
      });
    }
  });
  
  const currentPlayer = game.players[game.currentTurn];
  if (currentPlayer) {
    document.getElementById('currentTurn').textContent = `Turno de: ${currentPlayer.name}`;
  }

  const isCurrentPlayerTurn = game.currentTurn === currentPlayerIndex;
  document.getElementById('guessInput').disabled = !isCurrentPlayerTurn;
  document.getElementById('guessButton').disabled = !isCurrentPlayerTurn;

  if (game.status === 'finished') {
    alert(`¡El juego ha terminado! Ganador: Jugador ${game.winner + 1}`);
    endGame();
  }
}

function listenToGameChanges(gameId) {
  if (unsubscribeGameListener) {
    unsubscribeGameListener();
  }

  unsubscribeGameListener = db.collection('games').doc(gameId)
    .onSnapshot(
      doc => {
        const game = doc.data();
        game.id = doc.id;
        updateUI(game);
      },
      error => {
        console.error("Error listening to game changes: ", error);
        alert("Error al actualizar el juego. Por favor, recarga la página.");
      }
    );
}

function stopListeningToGameChanges() {
  if (unsubscribeGameListener) {
    unsubscribeGameListener();
    unsubscribeGameListener = null;
  }
}
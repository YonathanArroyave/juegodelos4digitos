function createGame(playerName) {
    const gameId = generateUniqueId();
    const player1 = {
      name: playerName,
      number: null,
      isReady: false
    };
    
    return db.collection('games').doc(gameId).set({
      players: [player1],
      currentTurn: null,
      status: 'waiting',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => gameId)
    .catch(error => {
      console.error("Error creating game: ", error);
      throw error;
    });
  }
  
  function joinGame(gameId, playerName) {
    const player2 = {
      name: playerName,
      number: null,
      isReady: false
    };
    
    return db.collection('games').doc(gameId).update({
      players: firebase.firestore.FieldValue.arrayUnion(player2)
    })
    .catch(error => {
      console.error("Error joining game: ", error);
      throw error;
    });
  }
  
  function validateNumber(number) {
    if (number.length !== 4 || !/^\d+$/.test(number)) return false;
    
    const digits = {};
    for (let digit of number) {
      digits[digit] = (digits[digit] || 0) + 1;
      if (digits[digit] > 2) return false;
    }
    
    return true;
  }
  
  function setPlayerNumber(gameId, playerIndex, number) {
    if (!validateNumber(number)) throw new Error('Número inválido');
    
    return db.collection('games').doc(gameId).update({
      [`players.${playerIndex}.number`]: number,
      [`players.${playerIndex}.isReady`]: true
    })
    .catch(error => {
      console.error("Error setting player number: ", error);
      throw error;
    });
  }
  
  function makeGuess(gameId, playerIndex, guess) {
    const gameRef = db.collection('games').doc(gameId);
    
    return db.runTransaction(async (transaction) => {
      const gameDoc = await transaction.get(gameRef);
      if (!gameDoc.exists) {
        throw "Game does not exist!";
      }
      
      const game = gameDoc.data();
      const opponentIndex = 1 - playerIndex;
      const opponentNumber = game.players[opponentIndex].number;
      
      if (!opponentNumber) {
        throw "Opponent has not set their number yet!";
      }
      
      const result = compareNumbers(guess, opponentNumber);
      
      transaction.update(gameRef, {
        [`players.${playerIndex}.guesses`]: firebase.firestore.FieldValue.arrayUnion({
          guess,
          result,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }),
        currentTurn: opponentIndex
      });
      
      return result;
    })
    .catch(error => {
      console.error("Error making guess: ", error);
      throw error;
    });
  }
  
  function compareNumbers(guess, target) {
    let correctPosition = 0;
    let correctDigit = 0;
    const guessDigits = {};
    const targetDigits = {};
    
    for (let i = 0; i < 4; i++) {
      if (guess[i] === target[i]) {
        correctPosition++;
      } else {
        guessDigits[guess[i]] = (guessDigits[guess[i]] || 0) + 1;
        targetDigits[target[i]] = (targetDigits[target[i]] || 0) + 1;
      }
    }
    
    for (let digit in guessDigits) {
      if (digit in targetDigits) {
        correctDigit += Math.min(guessDigits[digit], targetDigits[digit]);
      }
    }
    
    return { correctPosition, correctDigit };
  }
  
  function checkGameOver(gameId) {
    return db.collection('games').doc(gameId).get().then(doc => {
      const game = doc.data();
      const winner = game.players.findIndex(player => 
        player.guesses && player.guesses[player.guesses.length - 1].result.correctPosition === 4
      );
      
      if (winner !== -1) {
        return db.collection('games').doc(gameId).update({
          status: 'finished',
          winner
        });
      }
    })
    .catch(error => {
      console.error("Error checking game over: ", error);
      throw error;
    });
  }
  
  function restartGame(gameId) {
    return db.collection('games').doc(gameId).update({
      'players.0.number': null,
      'players.0.isReady': false,
      'players.0.guesses': [],
      'players.1.number': null,
      'players.1.isReady': false,
      'players.1.guesses': [],
      currentTurn: null,
      status: 'waiting'
    })
    .catch(error => {
      console.error("Error restarting game: ", error);
      throw error;
    });
  }
  
  function handleDisconnect(gameId, playerIndex) {
    return db.collection('games').doc(gameId).update({
      status: 'finished',
      winner: 1 - playerIndex
    })
    .catch(error => {
      console.error("Error handling disconnect: ", error);
      throw error;
    });
  }
  
  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }
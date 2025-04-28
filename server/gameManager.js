const WORDS = [
  'apple', 'banana', 'car', 'dog', 'elephant', 
  'flower', 'guitar', 'house', 'island', 'jacket',
  'kite', 'lion', 'mountain', 'notebook', 'ocean',
  'pizza', 'queen', 'rainbow', 'sun', 'tree',
  'umbrella', 'violin', 'window', 'xylophone', 'yacht',
  'zebra', 'airplane', 'basketball', 'computer', 'dolphin',
  'earth', 'football', 'giraffe', 'hamburger', 'internet'
];

// Game settings
const DEFAULT_ROUND_TIME = 60; // seconds
const POINTS_FOR_CORRECT_GUESS = 10;
const POINTS_FOR_DRAWER_WHEN_GUESSED = 5;

export function createGameManager() {
  // Data structures to store game state
  const rooms = new Map(); // roomId -> room data
  const players = new Map(); // playerId -> player data

  // Helper function to get a random word
  const getRandomWord = () => {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  };

  return {
    addPlayerToRoom(playerId, username, roomId) {
      // Create player data
      const playerData = {
        id: playerId,
        username,
        score: 0,
        rooms: new Set()
      };
      players.set(playerId, playerData);
      
      // Add roomId to player's rooms
      playerData.rooms.add(roomId);
      
      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          players: [],
          currentDrawer: null,
          currentWord: null,
          timeLeft: DEFAULT_ROUND_TIME,
          correctGuessers: new Set(),
          scores: {},
          isPaused: false,
          roundTime: DEFAULT_ROUND_TIME
        });
      }
      
      // Add player to room
      const room = rooms.get(roomId);
      room.players.push(playerId);
      room.scores[playerId] = 0;
      
      return playerData;
    },
    
    removePlayerFromRoom(playerId, roomId) {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId);
      
      // Remove player from room players array
      room.players = room.players.filter(id => id !== playerId);
      
      // Remove player from correctGuessers if present
      room.correctGuessers.delete(playerId);
      
      // Delete room if empty
      if (room.players.length === 0) {
        rooms.delete(roomId);
      }
      
      // Update player's room set
      if (players.has(playerId)) {
        players.get(playerId).rooms.delete(roomId);
        
        // Remove player if they're not in any rooms
        if (players.get(playerId).rooms.size === 0) {
          players.delete(playerId);
        }
      }
    },
    
    getPlayerRoom(playerId) {
      const player = players.get(playerId);
      if (!player) return null;
      
      // Return the first room (players should only be in one room at a time)
      for (const roomId of player.rooms) {
        return roomId;
      }
      
      return null;
    },
    
    getPlayerRooms(playerId) {
      const player = players.get(playerId);
      if (!player) return [];
      
      return Array.from(player.rooms);
    },
    
    getPlayerUsername(playerId) {
      const player = players.get(playerId);
      return player ? player.username : 'Unknown';
    },
    
    getPlayerIdByUsername(username, roomId) {
      if (!rooms.has(roomId)) return null;
      
      const room = rooms.get(roomId);
      for (const playerId of room.players) {
        const player = players.get(playerId);
        if (player && player.username === username) {
          return playerId;
        }
      }
      
      return null;
    },
    
    getRoomStatus(roomId) {
      if (!rooms.has(roomId)) {
        return {
          players: [],
          currentDrawer: null,
          currentWord: null,
          timeLeft: 0,
          scores: {},
          isPaused: false,
          roundTime: DEFAULT_ROUND_TIME
        };
      }
      
      const room = rooms.get(roomId);
      
      // Create player list with usernames
      const playerList = room.players.map(id => ({
        id,
        username: this.getPlayerUsername(id),
        score: room.scores[id] || 0,
        isDrawer: id === room.currentDrawer
      }));
      
      return {
        players: playerList,
        currentDrawer: room.currentDrawer,
        currentWord: room.currentWord,
        timeLeft: room.timeLeft,
        scores: room.scores,
        isPaused: room.isPaused,
        roundTime: room.roundTime
      };
    },
    
    isCurrentDrawer(playerId, roomId) {
      if (!rooms.has(roomId)) return false;
      
      return rooms.get(roomId).currentDrawer === playerId;
    },
    
    startNewRound(roomId, newDrawerId = null, customWord = null) {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId);
      
      // If no players, don't start a round
      if (room.players.length === 0) return;
      
      // Clear correct guessers
      room.correctGuessers.clear();
      
      // Set new drawer
      if (newDrawerId && room.players.includes(newDrawerId)) {
        room.currentDrawer = newDrawerId;
      } else {
        // If no drawer specified or invalid, pick next drawer
        const currentIndex = room.players.indexOf(room.currentDrawer);
        if (currentIndex === -1 || currentIndex === room.players.length - 1) {
          // No current drawer or at the end of list, start from first player
          room.currentDrawer = room.players[0];
        } else {
          // Move to next player
          room.currentDrawer = room.players[currentIndex + 1];
        }
      }
      
      // Set new word and reset timer
      room.currentWord = customWord || getRandomWord();
      room.timeLeft = room.roundTime;
      room.isPaused = false;
      
      return {
        currentDrawer: room.currentDrawer,
        currentWord: room.currentWord,
        timeLeft: room.timeLeft,
        isPaused: room.isPaused
      };
    },
    
    checkGuess(playerId, guess, roomId) {
      if (!rooms.has(roomId)) return false;
      
      const room = rooms.get(roomId);
      
      // If player has already guessed correctly, ignore
      if (room.correctGuessers.has(playerId)) return false;
      
      // Check if guess is correct (case insensitive)
      const isCorrect = guess.toLowerCase() === room.currentWord.toLowerCase();
      
      if (isCorrect) {
        // Add player to correctGuessers
        room.correctGuessers.add(playerId);
        
        // Award points to guesser
        room.scores[playerId] = (room.scores[playerId] || 0) + POINTS_FOR_CORRECT_GUESS;
        
        // Award points to drawer if someone guessed correctly
        if (room.currentDrawer) {
          room.scores[room.currentDrawer] = (room.scores[room.currentDrawer] || 0) + POINTS_FOR_DRAWER_WHEN_GUESSED;
        }
        
        // If everyone has guessed correctly, end the round
        if (room.correctGuessers.size >= room.players.length - 1) { // All except drawer
          room.timeLeft = 1; // Will trigger new round in the next timer tick
        }
      }
      
      return isCorrect;
    },
    
    decrementTimer(roomId) {
      if (!rooms.has(roomId)) return 0;
      
      const room = rooms.get(roomId);
      if (room.timeLeft > 0 && !room.isPaused) {
        room.timeLeft--;
      }
      
      return room.timeLeft;
    },
    
    getCurrentWord(roomId) {
      if (!rooms.has(roomId)) return null;
      
      return rooms.get(roomId).currentWord;
    },
    
    getActiveRooms() {
      return Array.from(rooms.keys());
    },

    // New methods for enhanced features
    toggleTimer(roomId) {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId);
      room.isPaused = !room.isPaused;
      return room.isPaused;
    },
    
    setRoundTime(roomId, seconds) {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId);
      room.roundTime = Math.max(30, Math.min(300, seconds)); // Limit between 30s and 5m
      room.timeLeft = room.roundTime;
      return room.roundTime;
    },
    
    restartRound(roomId) {
      if (!rooms.has(roomId)) return;
      
      const room = rooms.get(roomId);
      room.timeLeft = room.roundTime;
      room.isPaused = false;
      room.correctGuessers.clear();
      
      return {
        timeLeft: room.timeLeft,
        isPaused: room.isPaused
      };
    }
  };
}
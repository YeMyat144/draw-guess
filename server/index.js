import Fastify from 'fastify';
 import { Server } from 'socket.io';
 import cors from '@fastify/cors';
 import { createGameManager } from './gameManager.js';
 
 const fastify = Fastify({ logger: true });
 await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://drawnguess.vercel.app/']
    : '*',
  methods: ['GET', 'POST']
});

const io = new Server(fastify.server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://drawnguess.vercel.app/']
      : '*',
    methods: ['GET', 'POST']
  }
});
 const gameManager = createGameManager();
 
 io.on('connection', (socket) => {
   console.log('Client connected:', socket.id);
 
   socket.on('join-room', ({ username, roomId }) => {
     // Leave previous room if any
     const previousRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
     previousRooms.forEach(room => {
       gameManager.removePlayerFromRoom(socket.id, room);
       socket.leave(room);
     });
 
     // Join new room
     socket.join(roomId);
     const player = gameManager.addPlayerToRoom(socket.id, username, roomId);
     
     // Send room status to the new player
     const roomStatus = gameManager.getRoomStatus(roomId);
     socket.emit('room-joined', roomStatus);
     
     // Notify other players in the room
     socket.to(roomId).emit('player-joined', { username, id: socket.id });
     
     // If this is the first player, make them the drawer
     if (roomStatus.players.length === 1) {
       gameManager.startNewRound(roomId);
       const { currentWord, currentDrawer, timeLeft, isPaused } = gameManager.getRoomStatus(roomId);
       
       io.to(currentDrawer).emit('start-drawing', { word: currentWord });
       io.to(roomId).emit('new-round', { 
         drawerUsername: gameManager.getPlayerUsername(currentDrawer),
         timeLeft,
         isPaused
       });
     }
   });
 
   socket.on('drawing', ({ x, y, type }) => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId) return;
     
     // Only forward drawing if this player is the current drawer
     if (gameManager.isCurrentDrawer(socket.id, roomId)) {
       socket.to(roomId).emit('drawing', { x, y, type });
     }
   });
 
   socket.on('send-guess', ({ guess }) => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId) return;
     
     const roomStatus = gameManager.getRoomStatus(roomId);
     
     // Don't process guesses from the drawer
     if (socket.id === roomStatus.currentDrawer) {
       socket.emit('guess-result', { 
         correct: false, 
         username: gameManager.getPlayerUsername(socket.id),
         message: "You're the drawer, you can't guess!"
       });
       return;
     }
     
     // Check if guess is correct
     const isCorrect = gameManager.checkGuess(socket.id, guess, roomId);
     
     if (isCorrect) {
       // Notify all players of correct guess
       io.to(roomId).emit('guess-result', { 
         correct: true, 
         username: gameManager.getPlayerUsername(socket.id),
         message: `${gameManager.getPlayerUsername(socket.id)} guessed correctly!`
       });
       
       // Update scores
       const { scores } = gameManager.getRoomStatus(roomId);
       io.to(roomId).emit('update-scores', { scores });
       
       // Start new round with new drawer
       gameManager.startNewRound(roomId, socket.id);
       const { currentWord, currentDrawer, timeLeft, isPaused } = gameManager.getRoomStatus(roomId);
       
       io.to(currentDrawer).emit('start-drawing', { word: currentWord });
       io.to(roomId).emit('new-round', { 
         drawerUsername: gameManager.getPlayerUsername(currentDrawer),
         timeLeft,
         isPaused
       });
     } else {
       // Send the guess to everyone in the room
       io.to(roomId).emit('chat-message', {
         username: gameManager.getPlayerUsername(socket.id),
         message: guess
       });
     }
   });
 
   // Enhanced drawer controls
   socket.on('toggle-timer', () => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId || !gameManager.isCurrentDrawer(socket.id, roomId)) return;
     
     const isPaused = gameManager.toggleTimer(roomId);
     io.to(roomId).emit('timer-state-changed', { isPaused });
   });
 
   socket.on('set-round-time', ({ seconds }) => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId || !gameManager.isCurrentDrawer(socket.id, roomId)) return;
     
     const newTime = gameManager.setRoundTime(roomId, seconds);
     io.to(roomId).emit('round-time-updated', { timeLeft: newTime });
   });
 
   socket.on('restart-round', () => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId || !gameManager.isCurrentDrawer(socket.id, roomId)) return;
     
     const { timeLeft, isPaused } = gameManager.restartRound(roomId);
     io.to(roomId).emit('round-restarted', { timeLeft, isPaused });
   });
 
   socket.on('set-custom-word', ({ word }) => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId || !gameManager.isCurrentDrawer(socket.id, roomId)) return;
     
     gameManager.startNewRound(roomId, socket.id, word);
     const { currentWord, currentDrawer, timeLeft, isPaused } = gameManager.getRoomStatus(roomId);
     
     io.to(currentDrawer).emit('start-drawing', { word: currentWord });
     io.to(roomId).emit('new-round', { 
       drawerUsername: gameManager.getPlayerUsername(currentDrawer),
       timeLeft,
       isPaused
     });
   });
 
   socket.on('switch-role', ({ newDrawer }) => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId) return;
     
     // Only current drawer can switch roles
     if (gameManager.isCurrentDrawer(socket.id, roomId)) {
       const playerId = gameManager.getPlayerIdByUsername(newDrawer, roomId);
       if (playerId) {
         gameManager.startNewRound(roomId, playerId);
         const { currentWord, currentDrawer, timeLeft, isPaused } = gameManager.getRoomStatus(roomId);
         
         io.to(currentDrawer).emit('start-drawing', { word: currentWord });
         io.to(roomId).emit('new-round', { 
           drawerUsername: gameManager.getPlayerUsername(currentDrawer),
           timeLeft,
           isPaused
         });
       }
     }
   });
 
   socket.on('clear-canvas', () => {
     const roomId = gameManager.getPlayerRoom(socket.id);
     if (!roomId || !gameManager.isCurrentDrawer(socket.id, roomId)) return;
     
     socket.to(roomId).emit('clear-canvas');
   });
 
   socket.on('disconnect', () => {
     console.log('Client disconnected:', socket.id);
     
     // Find all rooms this player was in
     const rooms = gameManager.getPlayerRooms(socket.id);
     
     // Remove player from all rooms
     rooms.forEach(roomId => {
       const username = gameManager.getPlayerUsername(socket.id);
       gameManager.removePlayerFromRoom(socket.id, roomId);
       
       // Notify other players
       socket.to(roomId).emit('player-left', { username, id: socket.id });
       
       // If this was the drawer, start a new round
       const roomStatus = gameManager.getRoomStatus(roomId);
       if (roomStatus && roomStatus.players.length > 0 && roomStatus.currentDrawer === socket.id) {
         gameManager.startNewRound(roomId);
         const { currentWord, currentDrawer, timeLeft, isPaused } = gameManager.getRoomStatus(roomId);
         
         if (currentDrawer) {
           io.to(currentDrawer).emit('start-drawing', { word: currentWord });
           io.to(roomId).emit('new-round', { 
             drawerUsername: gameManager.getPlayerUsername(currentDrawer),
             timeLeft,
             isPaused
           });
         }
       }
     });
   });
 });
 
 // Start timer updates for all active rooms
 setInterval(() => {
   const activeRooms = gameManager.getActiveRooms();
   
   activeRooms.forEach(roomId => {
     const timeLeft = gameManager.decrementTimer(roomId);
     const { isPaused } = gameManager.getRoomStatus(roomId);
     io.to(roomId).emit('timer-tick', { secondsLeft: timeLeft, isPaused });
     
     // If timer reaches 0, start new round
     if (timeLeft <= 0) {
       const currentWord = gameManager.getCurrentWord(roomId);
       io.to(roomId).emit('round-end', { 
         message: `Time's up! The word was "${currentWord}"`,
         word: currentWord
       });
       
       gameManager.startNewRound(roomId);
       const { currentWord: newWord, currentDrawer, timeLeft: newTime, isPaused } = gameManager.getRoomStatus(roomId);
       
       if (currentDrawer) {
         io.to(currentDrawer).emit('start-drawing', { word: newWord });
         io.to(roomId).emit('new-round', { 
           drawerUsername: gameManager.getPlayerUsername(currentDrawer),
           timeLeft: newTime,
           isPaused
         });
       }
     }
   });
 }, 1000);
 
 // Start the server
 const start = async () => {
   try {
     await fastify.listen({ port: 3000, host: '0.0.0.0' });
     console.log('Server is running on http://localhost:3000');
   } catch (err) {
     fastify.log.error(err);
     process.exit(1);
   }
 };
 
 start();
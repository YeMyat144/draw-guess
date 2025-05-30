<script setup lang="ts">
 import { ref, onMounted, onBeforeUnmount } from 'vue';
 import { io, Socket } from 'socket.io-client';
 import DrawingCanvas from './DrawingCanvas.vue';
 import Chat from './Chat.vue';
 import PlayerList from './PlayerList.vue';
 import Timer from './Timer.vue';
 
 const props = defineProps<{
   username: string;
   roomId: string;
 }>();
 
 // Socket connection
  let socket: Socket | null = null;


 
 // Game state
 const isConnected = ref(false);
 const isDrawer = ref(false);
 const currentWord = ref('');
 const drawerUsername = ref('');
 const timeLeft = ref(60);
 const roundTime = ref(60);
 const isPaused = ref(false);
 const players = ref<any[]>([]);
 const messages = ref<{ username: string; message: string; isSystemMessage?: boolean }[]>([]);
 
 // Connect to socket server
 onMounted(() => {
   // Connect to the socket server
   
   socket = io('https://drawguess-backend.onrender.com', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

   socket.on('connect', () => {
     isConnected.value = true;
     console.log('Connected to server');
     
     // Join the room
     socket?.emit('join-room', { username: props.username, roomId: props.roomId });
   });
   
   socket.on('room-joined', (data) => {
     console.log('Room joined:', data);
     players.value = data.players || [];
     drawerUsername.value = data.currentDrawer ? 
       players.value.find(p => p.id === data.currentDrawer)?.username || '' : '';
     timeLeft.value = data.timeLeft || 60;
     roundTime.value = data.roundTime || 60;
     isPaused.value = data.isPaused || false;
     
     const systemMessage = {
       username: 'System',
       message: `Welcome to room ${props.roomId}!`,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('start-drawing', (data) => {
     isDrawer.value = true;
     currentWord.value = data.word;
     const systemMessage = {
       username: 'System',
       message: `You are drawing: ${data.word}`,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('new-round', (data) => {
     drawerUsername.value = data.drawerUsername;
     timeLeft.value = data.timeLeft;
     isPaused.value = data.isPaused;
     
     // Reset drawer status if someone else is drawing
     if (data.drawerUsername !== props.username) {
       isDrawer.value = false;
       currentWord.value = '';
     }
     
     const systemMessage = {
       username: 'System',
       message: `New round started! ${data.drawerUsername} is drawing.`,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('timer-tick', (data) => {
     timeLeft.value = data.secondsLeft;
     isPaused.value = data.isPaused;
   });
   
   socket.on('timer-state-changed', (data) => {
     isPaused.value = data.isPaused;
     const systemMessage = {
       username: 'System',
       message: data.isPaused ? 'Drawing paused' : 'Drawing resumed',
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('round-time-updated', (data) => {
     timeLeft.value = data.timeLeft;
     roundTime.value = data.timeLeft;
     const systemMessage = {
       username: 'System',
       message: `Round time set to ${data.timeLeft} seconds`,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('round-restarted', (data) => {
     timeLeft.value = data.timeLeft;
     isPaused.value = data.isPaused;
     const systemMessage = {
       username: 'System',
       message: 'Round restarted',
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('round-end', (data) => {
     const systemMessage = {
       username: 'System',
       message: data.message,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('player-joined', (data) => {
     players.value.push({
       id: data.id,
       username: data.username,
       score: 0,
       isDrawer: false
     });
     
     const systemMessage = {
       username: 'System',
       message: `${data.username} joined the room.`,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('player-left', (data) => {
     players.value = players.value.filter(player => player.id !== data.id);
     
     const systemMessage = {
       username: 'System',
       message: `${data.username} left the room.`,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('chat-message', (data) => {
     messages.value.push(data);
   });
   
   socket.on('guess-result', (data) => {
     const systemMessage = {
       username: 'System',
       message: data.message,
       isSystemMessage: true
     };
     messages.value.push(systemMessage);
   });
   
   socket.on('update-scores', (data) => {
     // Update player scores
     for (const player of players.value) {
       if (data.scores[player.id] !== undefined) {
         player.score = data.scores[player.id];
       }
     }
   });
   
   socket.on('disconnect', () => {
     isConnected.value = false;
     console.log('Disconnected from server');
   });
 });
 
 // Disconnect socket on component unmount
 onBeforeUnmount(() => {
   if (socket) {
     socket.disconnect();
   }
 });
 
 // Handle sending a guess
 const sendGuess = (guess: string) => {
   if (!socket || !isConnected.value) return;
   
   socket.emit('send-guess', { guess });
 };
 
 // Handle drawing event
 const handleDrawing = (drawingData: { x: number; y: number; type: string }) => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('drawing', drawingData);
 };
 
 // Handle requesting to be the drawer
 const requestDrawer = (username: string) => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('switch-role', { newDrawer: username });
 };
 
 // Handle clearing the canvas
 const clearCanvas = () => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('clear-canvas');
 };
 
 // Handle timer controls
 const handleToggleTimer = () => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('toggle-timer');
 };
 
 const handleSetRoundTime = (seconds: number) => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('set-round-time', { seconds });
 };
 
 const handleRestartRound = () => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('restart-round');
 };
 
 const handleSetCustomWord = (word: string) => {
   if (!socket || !isConnected.value || !isDrawer.value) return;
   
   socket.emit('set-custom-word', { word });
 };
 const copyRoomId = () => {
  navigator.clipboard.writeText(props.roomId).then(() => {
    const systemMessage = {
      username: 'System',
      message: 'Room ID copied to clipboard!',
      isSystemMessage: true
    };
    messages.value.push(systemMessage);
  }).catch(err => {
    console.error('Failed to copy room ID: ', err);
  });
};
 </script>
 
 <template>
   <div class="game-room">
     <header class="game-header">
       <div class="room-info">
         <h2>Room: {{ roomId }}</h2>
         <button @click="copyRoomId" class="copy-button" title="Copy room ID">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </button>
         <div class="current-drawer" v-if="drawerUsername">
         <span v-if="isDrawer">Draw: <strong>{{ currentWord }}</strong></span>
         <span v-else>{{ drawerUsername }} is drawing</span>
       </div>
       </div>
       <Timer 
       class="timer"
           :seconds-left="timeLeft" 
           :is-paused="isPaused"
           :is-drawer="isDrawer"
           @toggle-timer="handleToggleTimer"
           @set-round-time="handleSetRoundTime"
           @restart-round="handleRestartRound"
         />
       
     </header>
     
     <div class="game-content">
       <div class="game-main">
         <DrawingCanvas 
           :socket="socket || null"
           :is-drawer="isDrawer" 
           :is-paused="isPaused"
           :round-time="roundTime"
           @drawing="handleDrawing" 
           @clear-canvas="clearCanvas"
           @toggle-timer="handleToggleTimer"
           @set-round-time="handleSetRoundTime"
           @restart-round="handleRestartRound"
           @set-custom-word="handleSetCustomWord"
         />
       </div>
       
       <div class="game-sidebar">
         <Chat 
           :messages="messages" 
           :is-drawer="isDrawer"
           @send-guess="sendGuess" 
         />
         <PlayerList 
           :players="players" 
           :current-user="username" 
           :is-drawer="isDrawer"
           @request-drawer="requestDrawer"
         />
       </div>
     </div>
   </div>
 </template>
 
 <style scoped>
 .game-room {
   display: flex;
   flex-direction: column;
   height: 100vh;
   overflow: hidden;
   background-color: #353537;
 }
 
 .game-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 1rem;
   background-color: #353537;
   border-bottom: 1px solid #4b4a4a;
 }
 
 .room-info {
   display: flex;
   align-items: center;
   justify-content: space-between;
 }
 
 .room-info h2 {
   font-size: 1.5rem;
   font-weight: 600;
   color: #6db432;
 }
 
 .copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  color: #6db432;
  transition: color 0.2s;
}

.copy-button:hover {
  color: #8fd45a;
}

.copy-button svg {
  display: block;
}
 .current-drawer {
   margin-left: 2.5rem;
   padding: 2px 8px;
   border-radius: 4px;
   background-color: #7b7b7d;
   font-weight: 400;
   color: white;
 }
 .timer {
   color: #353537;
 }
 
 .game-content {
   display: flex;
   flex: 1;
   overflow: hidden;
   background-color: #353537;
 }
 
 .game-main {
   flex: 1;
   display: flex;
   flex-direction: column;
   padding: 1rem;
   overflow: hidden;
   background-color: #353537;
 }
 
 .game-sidebar {
   width: 300px;
   display: flex;
   flex-direction: column;
   border-left: 1px solid #353537;
   background-color: #353537;
 }
 
 @media (max-width: 768px) {
   .game-content {
     flex-direction: column;
   }
   
   .game-sidebar {
     width: 100%;
     border-left: none;
     height: 40vh;
   }
   
   .game-header {
     flex-direction: column;
     align-items: flex-start;
   }
   
   .room-info h2 {
     font-size: 1.25rem;
   }
   
   .timer {
     width: 100%;
     text-align: center;
   }
 }
 </style>
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
 </script>
 
 <template>
   <div class="game-room">
     <header class="game-header">
       <div class="room-info">
         <h2>Room: {{ roomId }}</h2>
         
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
   background-color: #fff;
 }
 
 .game-header {
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 1rem;
   background-color: #fed7bf;
   border-bottom: 1px solid #e4afb0;
   box-shadow: 0 2px 4px rgba(154, 119, 135, 0.1);
 }
 
 .room-info {
   display: flex;
   align-items: center;
   gap: 1rem;
 }
 
 .room-info h2 {
   font-size: 1.5rem;
   font-weight: 600;
   margin: 0;
   color: #9a7787;
 }
 
 .current-drawer {
   padding: 0.5rem 1rem;
   background-color: #e4afb0;
   border-radius: 6px;
   font-weight: 500;
   color: #fff;
 }
 .timer {
   color: #fff;
 }
 
 .game-content {
   display: flex;
   flex: 1;
   overflow: hidden;
   background-color: #fff;
 }
 
 .game-main {
   flex: 1;
   display: flex;
   flex-direction: column;
   padding: 1rem;
   overflow: hidden;
   background-color: #fff;
 }
 
 .game-sidebar {
   width: 300px;
   display: flex;
   flex-direction: column;
   border-left: 1px solid #e4afb0;
   background-color: #fff;
 }
 
 @media (max-width: 768px) {
   .game-content {
     flex-direction: column;
   }
   
   .game-sidebar {
     width: 100%;
     border-left: none;
     border-top: 1px solid #e4afb0;
     height: 40vh;
   }
   
   .game-header {
     flex-direction: column;
     align-items: flex-start;
     gap: 0.5rem;
     padding: 0.75rem;
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
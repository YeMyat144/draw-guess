<script setup lang="ts">
import { ref } from 'vue';
import GameRoom from './components/GameRoom.vue';
import JoinRoom from './components/JoinRoom.vue';

const isJoined = ref(false);
const username = ref('');
const roomId = ref('');

// Function to handle joining a room
const handleJoinRoom = (data: { username: string; roomId: string }) => {
  username.value = data.username;
  roomId.value = data.roomId;
  isJoined.value = true;
};
</script>

<template>
  <div class="app-container">
    <div v-if="!isJoined" class="join-container">
      <h1 class="app-title">Draw | Guess</h1>
      <JoinRoom @join-room="handleJoinRoom" />
    </div>
    <GameRoom 
      v-else
      :username="username"
      :roomId="roomId"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #353537;
  color: #fff;
  line-height: 1.5;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #353537;
  padding: 1rem;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.join-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #353537;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #6db432;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
}
</style>
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
      <h1 class="app-title">Draw & Guess</h1>
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
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #fff;
  color: #9a7787;
  line-height: 1.5;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.app-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.join-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4afb0;
}

.app-title {
  font-size: 3rem;
  color: #9a7787;
  margin-bottom: 1rem;
  text-align: center;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .join-container {
    padding: 1rem;
  }
  
  .app-title {
    font-size: 2rem;
  }
}
</style>
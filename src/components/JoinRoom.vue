<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['join-room']);

const username = ref('');
const roomId = ref('');
const error = ref('');
const copySuccess = ref(false);

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Set initial room ID
roomId.value = generateRoomId();

const handleJoin = () => {
  if (!username.value.trim()) {
    error.value = 'Please enter a username';
    return;
  }
  
  if (!roomId.value.trim()) {
    error.value = 'Please enter a room ID';
    return;
  }
  
  error.value = '';
  emit('join-room', { username: username.value, roomId: roomId.value });
};

const createNewRoom = () => {
  roomId.value = generateRoomId();
  copySuccess.value = false;
};

const copyRoomId = async () => {
  try {
    await navigator.clipboard.writeText(roomId.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy room ID:', err);
  }
};
</script>

<template>
  <div class="join-room">
    <div class="join-form">
      <h1 class="form-title">Join Room</h1>
      <div class="form-group">
        <label for="username">Your Name</label>
        <input 
          type="text" 
          id="username"
          v-model="username"
          placeholder="Enter your name"
          @keyup.enter="handleJoin"
        />
      </div>
      
      <div class="form-group">
        <label for="roomId">Room Code</label>
        <div class="room-id-group">
          <input 
            type="text" 
            id="roomId"
            v-model="roomId"
            placeholder="Enter room code"
            @keyup.enter="handleJoin"
          />
          <button @click="createNewRoom" class="new-room-button">
            New
          </button>
          <button @click="copyRoomId" class="copy-button" :class="{ 'copy-success': copySuccess }">
            {{ copySuccess ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <small>Share this code with friends to play together</small>
      </div>
      
      <p v-if="error" class="error-message">{{ error }}</p>
      
      <button @click="handleJoin" class="join-button">
        Join Room
      </button>
    </div>
  </div>
</template>

<style scoped>
.join-room {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #fff;
  padding: 2rem;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.join-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  border: 1px solid #e4afb0;
}

.form-title {
  text-align: center;
  color: #9a7787;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #9a7787;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e4afb0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.25s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #9a7787;
}

.room-id-group {
  display: flex;
  gap: 0.5rem;
}

.room-id-group input {
  flex: 1;
}

.copy-button {
  padding: 0.75rem 1rem;
  background-color: #fed7bf;
  color: #9a7787;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s ease;
  font-family: inherit;
  border: 1px solid #e4afb0;
}

.copy-button:hover {
  background-color: #e4afb0;
  color: #fff;
}

.copy-success {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fed7bf;
  color: #9a7787;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  animation: fadeInOut 2s ease-in-out;
  border: 1px solid #e4afb0;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.error-message {
  color: #9a7787;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.join-button {
  width: 100%;
  padding: 1rem;
  background-color: #fed7bf;
  color: #9a7787;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.25s ease;
  font-family: inherit;
  border: 1px solid #e4afb0;
  margin-top: 1rem;
}

.join-button:hover {
  background-color: #e4afb0;
  color: #fff;
}

.new-room-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #fed7bf;
  color: #9a7787;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s ease;
  font-family: inherit;
  border: 1px solid #e4afb0;
}

.new-room-button:hover {
  background-color: #e4afb0;
  color: #fff;
}

small {
  display: block;
  font-size: 0.8rem;
  color: #9a7787;
  margin-top: 0.3rem;
  opacity: 0.8;
}

@media (max-width: 500px) {
  .join-room {
    padding: 1.5rem;
  }
}
</style>
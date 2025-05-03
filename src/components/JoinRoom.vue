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
  background: linear-gradient(135deg, #1e90ff 0%, #87ceeb 100%);
  padding: 2rem;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.join-form {
  background-color: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  border: 3px solid #ffd700;
}

.form-title {
  text-align: center;
  color: #ff6b6b;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ff6b6b;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ffd700;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
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
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  border: 2px solid #ffd700;
}

.copy-button:hover {
  transform: scale(1.05);
  background-color: #ff8c8c;
}

.copy-success {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #4CAF50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  animation: fadeInOut 2s ease-in-out;
  border: 2px solid #ffd700;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.error-message {
  color: #ff6b6b;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.join-button {
  width: 100%;
  padding: 1rem;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  border: 2px solid #ffd700;
  margin-top: 1rem;
}

.join-button:hover {
  transform: scale(1.05);
  background-color: #ff8c8c;
}

.new-room-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #ffd700;
  color: #333;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  border: 2px solid #ff6b6b;
}

.new-room-button:hover {
  transform: scale(1.05);
  background-color: #ffeb3b;
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
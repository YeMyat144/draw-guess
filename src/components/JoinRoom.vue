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
      <div class="room-id-container">
        <input 
          type="text" 
          id="roomId"
          v-model="roomId"
          placeholder="Enter room code"
          @keyup.enter="handleJoin"
        />
        <button @click="createNewRoom" class="btn btn-secondary">
          New
        </button>
        <button @click="copyRoomId" class="btn btn-secondary" :class="{ 'btn-success': copySuccess }">
          {{ copySuccess ? 'Copied!' : 'Copy' }}
        </button>
      </div>
      <small>Share this code with friends to play together</small>
    </div>
    
    <p v-if="error" class="error-message">{{ error }}</p>
    
    <button @click="handleJoin" class="btn btn-primary">
      Join Room
    </button>
  </div>
</template>

<style scoped>
.join-room {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(154, 119, 135, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #9a7787;
}

input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #e4afb0;
  border-radius: 6px;
  background: #fff;
  color: #9a7787;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #9a7787;
  box-shadow: 0 0 0 3px rgba(154, 119, 135, 0.15);
}

.room-id-container {
  display: flex;
  gap: 0.5rem;
}

.room-id-container input {
  flex: 1;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: #9a7787;
  color: white;
  width: 100%;
  margin-top: 1rem;
}

.btn-primary:hover {
  background-color: #8a6777;
}

.btn-secondary {
  background-color: #fed7bf;
  color: #9a7787;
}

.btn-secondary:hover {
  background-color: #fdc7af;
}

.btn-success {
  background-color: #9a7787;
  color: white;
}

.btn-success:hover {
  background-color: #8a6777;
}

small {
  display: block;
  font-size: 0.8rem;
  color: #9a7787;
  margin-top: 0.3rem;
  opacity: 0.8;
}

.error-message {
  color: #e4afb0;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 500px) {
  .join-room {
    padding: 1.5rem;
  }
}
</style>
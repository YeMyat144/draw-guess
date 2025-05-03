<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';

const props = defineProps<{
  messages: { username: string; message: string; isSystemMessage?: boolean }[];
  isDrawer: boolean;
}>();

const emit = defineEmits(['send-guess']);

const guessInput = ref('');
const chatContainer = ref<HTMLDivElement | null>(null);

// Send a guess
const sendGuess = () => {
  if (!guessInput.value.trim()) return;
  
  emit('send-guess', guessInput.value);
  guessInput.value = '';
};

// Scroll to bottom when new messages arrive
watch(() => props.messages.length, async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
});
</script>

<template>
  <div class="chat-component">
    <div class="chat-header">
      <h3>Chat</h3>
    </div>
    
    <div class="chat-messages" ref="chatContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message"
        :class="{
          'system-message': message.isSystemMessage,
          'own-message': message.username === 'You'
        }"
      >
        <span class="message-username" v-if="!message.isSystemMessage">
          {{ message.username }}:
        </span>
        <span class="message-content">{{ message.message }}</span>
      </div>
    </div>
    
    <div class="chat-input">
      <input 
        type="text" 
        v-model="guessInput"
        :placeholder="isDrawer ? 'You are drawing...' : 'Type your guess...'"
        :disabled="isDrawer"
        @keyup.enter="sendGuess"
      />
      <button @click="sendGuess" :disabled="isDrawer">
        Send
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-component {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid #ffd700;
  overflow: hidden;
}

.chat-header {
  background-color: #ff6b6b;
  padding: 15px;
  text-align: center;
  border-bottom: 2px solid #ffd700;
}

.chat-header h3 {
  margin: 0;
  color: white;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.chat-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background-color: #f0f8ff;
}

.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 80%;
  word-wrap: break-word;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.system-message {
  background-color: #ffd700;
  color: #333;
  text-align: center;
  margin: 10px auto;
  padding: 8px 15px;
  border-radius: 15px;
  font-style: italic;
  border: 2px solid #ff6b6b;
}

.own-message {
  background-color: #1e90ff;
  color: white;
  margin-left: auto;
  border: 2px solid #ffd700;
}

.message-username {
  font-weight: bold;
  margin-right: 5px;
  color: #ff6b6b;
}

.chat-input {
  display: flex;
  padding: 15px;
  background-color: #fff;
  border-top: 2px solid #ffd700;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 2px solid #ffd700;
  border-radius: 8px;
  margin-right: 10px;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.chat-input input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.chat-input button {
  padding: 10px 20px;
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

.chat-input button:hover {
  transform: scale(1.05);
  background-color: #ff8c8c;
}

.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
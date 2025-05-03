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
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4afb0;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #e4afb0;
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
  font-weight: 500;
  color: #9a7787;
}

.message-content {
  color: #9a7787;
}

.message-time {
  font-size: 0.8rem;
  color: #9a7787;
  opacity: 0.7;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e4afb0;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e4afb0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.25s ease;
}

.chat-input input:focus {
  outline: none;
  border-color: #9a7787;
}

.chat-input button {
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

.chat-input button:hover {
  background-color: #e4afb0;
  color: #fff;
}

@media (max-width: 768px) {
  .chat {
    height: 300px;
  }
  
  .chat-input {
    padding: 0.75rem;
  }
  
  .chat-input input {
    padding: 0.5rem;
  }
  
  .chat-input button {
    padding: 0.5rem 1rem;
  }
}
</style>
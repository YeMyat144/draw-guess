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
        v-for="(message, index) in messages.filter(m => !m.isSystemMessage)" 
        :key="index"
        class="message"
        :class="{
          'system-message': message.isSystemMessage,
          'own-message': message.username === 'You'
        }"
      >
        <span class="message-username"  v-if="!message.isSystemMessage">
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
  height: 50%;
  border-top: 1px solid #e4afb0;
  background-color: #fff;
}

.chat-header {
  padding: 0.75rem 1rem;
  background-color: #fed7bf;
  border-bottom: 1px solid #e4afb0;
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #9a7787;
  font-weight: 600;
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
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background-color: #fed7bf;
  max-width: 80%;
  word-break: break-word;
}

.own-message {
  background-color: #9a7787;
  color: white;
  align-self: flex-end;
}

.message-username {
  font-weight: 500;
  margin-right: 0.5rem;
}

.message-content {
  word-break: break-word;
}

.chat-input {
  padding: 0.75rem;
  background-color: #fff;
  border-top: 1px solid #e4afb0;
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e4afb0;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #9a7787;
}

.chat-input input:focus {
  outline: none;
  border-color: #9a7787;
}

.chat-input input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chat-input button {
  padding: 0.5rem 1rem;
  background-color: #9a7787;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-input button:hover:not(:disabled) {
  background-color: #e4afb0;
  transform: translateY(-1px);
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-component {
    height: auto;
    min-height: 200px;
  }
  
  .message {
    max-width: 90%;
  }
}
</style>
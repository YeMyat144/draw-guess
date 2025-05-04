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
  height: 50%;
  background-color: #353537;
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
  border: none;
  background-color: #353537;
  max-width: 80%;
  word-break: break-word;
}

.own-message {
  background-color: #353537;
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
  background-color: #353537;
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  font-size: 0.9rem;
  color: #353537;
}

.chat-input input:focus {
  outline: none;
  border-color: #353537;
}

.chat-input input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.chat-input button {
  padding: 0.5rem 1rem;
  background-color: #6db432;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.chat-input button:hover:not(:disabled) {
  background-color: #8bc064;
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
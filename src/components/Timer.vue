<script setup lang="ts">
const props = defineProps<{
  secondsLeft: number;
  isPaused: boolean;
  isDrawer?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-timer'): void;
  (e: 'set-round-time', seconds: number): void;
  (e: 'restart-round'): void;
}>();

// Calculate percentage for progress bar
const progressPercentage = () => {
  // Assuming a round is 60 seconds by default
  return (props.secondsLeft / 60) * 100;
};

// Format time as MM:SS
const formattedTime = () => {
  const minutes = Math.floor(props.secondsLeft / 60);
  const seconds = props.secondsLeft % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Get color based on time left
const progressColor = () => {
  if (props.secondsLeft > 30) {
    return '#2EC4B6'; // Green
  } else if (props.secondsLeft > 10) {
    return '#FFBF00'; // Yellow
  } else {
    return '#E71D36'; // Red
  }
};

// Handle time duration change
const handleTimeChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const seconds = parseInt(input.value);
  if (seconds >= 10 && seconds <= 300) { // Limit between 10 seconds and 5 minutes
    emit('set-round-time', seconds);
  }
};
</script>

<template>
  <div class="timer">
    <div class="timer-display">{{ formattedTime() }}</div>
    <div class="timer-progress-container">
      <div 
        class="timer-progress-bar"
        :style="{ 
          width: `${progressPercentage()}%`,
          backgroundColor: progressColor()
        }"
      ></div>
    </div>
    <div v-if="isDrawer" class="timer-controls">
      <button 
        class="timer-button"
        @click="emit('toggle-timer')"
      >
        {{ isPaused ? 'Resume' : 'Pause' }}
      </button>
      <button 
        class="timer-button"
        @click="emit('restart-round')"
      >
        Restart
      </button>
      <div class="time-input-container">
        <input 
          type="number" 
          class="time-input"
          :value="secondsLeft"
          @change="handleTimeChange"
          min="10"
          max="300"
          step="10"
        />
        <span class="time-input-label">seconds</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid #ffd700;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.timer-display {
  font-size: 2.5rem;
  font-weight: bold;
  color: #ff6b6b;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.progress-container {
  width: 100%;
  height: 20px;
  background-color: #f0f8ff;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #ffd700;
}

.progress-bar {
  height: 100%;
  transition: width 1s linear;
  background: linear-gradient(90deg, #ff6b6b 0%, #ffd700 100%);
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.timer-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.timer-button:hover {
  transform: scale(1.05);
}

.toggle-button {
  background-color: #ff6b6b;
  color: white;
  border: 2px solid #ffd700;
}

.toggle-button:hover {
  background-color: #ff8c8c;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.time-input label {
  color: #ff6b6b;
  font-weight: bold;
}

.time-input input {
  width: 60px;
  padding: 5px;
  border: 2px solid #ffd700;
  border-radius: 5px;
  text-align: center;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.time-input input:focus {
  outline: none;
  border-color: #ff6b6b;
}

.restart-button {
  background-color: #ffd700;
  color: #333;
  border: 2px solid #ff6b6b;
}

.restart-button:hover {
  background-color: #ffeb3b;
}

@media (max-width: 768px) {
  .timer {
    padding: 10px;
  }
  
  .timer-display {
    font-size: 2rem;
  }
  
  .controls {
    flex-direction: column;
    width: 100%;
  }
  
  .timer-button {
    width: 100%;
  }
}
</style>
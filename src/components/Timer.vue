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
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4afb0;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.timer-display {
  font-size: 2.5rem;
  font-weight: 500;
  color: #9a7787;
  margin: 0;
}

.progress-container {
  width: 100%;
  height: 20px;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e4afb0;
}

.progress-bar {
  height: 100%;
  transition: width 1s linear;
  background: linear-gradient(90deg, #fed7bf 0%, #e4afb0 100%);
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
  font-weight: 500;
  transition: all 0.25s ease;
  font-family: inherit;
}

.timer-button:hover {
  background-color: #e4afb0;
  color: #fff;
}

.toggle-button {
  background-color: #fed7bf;
  color: #9a7787;
  border: 1px solid #e4afb0;
}

.toggle-button:hover {
  background-color: #e4afb0;
  color: #fff;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.time-input label {
  color: #9a7787;
  font-weight: 500;
}

.time-input input {
  width: 60px;
  padding: 5px;
  border: 1px solid #e4afb0;
  border-radius: 5px;
  text-align: center;
  font-family: inherit;
}

.time-input input:focus {
  outline: none;
  border-color: #9a7787;
}

.restart-button {
  background-color: #fed7bf;
  color: #9a7787;
  border: 1px solid #e4afb0;
}

.restart-button:hover {
  background-color: #e4afb0;
  color: #fff;
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
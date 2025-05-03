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
   min-width: 100px;
   background-color: #353537;
   padding: 0.5rem;
   border-radius: 8px;
 }
 
 .timer-display {
   font-weight: 600;
   font-size: 1.1rem;
   text-align: center;
   color: #6db432;
 }
 
 .timer-progress-container {
   height: 6px;
   background-color: #fff;
   border-radius: 3px;
   overflow: hidden;
   margin-top: 4px;
 }
 
 .timer-progress-bar {
   height: 100%;
   transition: width 1s linear, background-color 1s;
   background-color: #6db432;
 }
 
 .timer-controls {
   display: flex;
   gap: 8px;
   margin-top: 8px;
   justify-content: center;
   align-items: center;
   flex-wrap: wrap;
 }
 
 .timer-button {
   padding: 4px 8px;
   border: none;
   border-radius: 4px;
   background-color: #6db432;
   color: white;
   cursor: pointer;
   font-size: 0.9rem;
   transition: all 0.2s ease;
 }
 
 .timer-button:hover {
   background-color: #8bc064;
   transform: translateY(-1px);
 }
 
 .time-input-container {
   display: flex;
   align-items: center;
   gap: 4px;
 }
 
 .time-input {
   width: 60px;
   padding: 4px;
   border:none;
   text-align: center;
   color: #6db432;
   background-color: #fff;
 }
 
 .time-input:focus {
   outline: none;
   border-color: #6db432;
 }
 
 .time-input-label {
   font-size: 0.9rem;
   color: #6db432;
 }
 
 @media (max-width: 768px) {
   .timer {
     min-width: 80px;
     padding: 0.25rem;
   }
   
   .timer-display {
     font-size: 1rem;
   }
   
   .timer-button {
     padding: 3px 6px;
     font-size: 0.8rem;
   }
   
   .time-input {
     width: 50px;
   }
 }
 </style>
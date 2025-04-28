<script setup lang="ts">
 import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
 import type { Socket } from 'socket.io-client';
 
 const props = defineProps<{
   isDrawer: boolean;
   socket: Socket;
   isPaused?: boolean;
   roundTime?: number;
 }>();
 
 const emit = defineEmits(['drawing', 'clear-canvas', 'toggle-timer', 'set-round-time', 'restart-round', 'set-custom-word']);
 
 const canvasRef = ref<HTMLCanvasElement | null>(null);
 const canvasContext = ref<CanvasRenderingContext2D | null>(null);
 const isDrawing = ref(false);
 const selectedColor = ref('#000000');
 const lineWidth = ref(5);
 const customWord = ref('');
 const showCustomWordInput = ref(false);
 
 const colors = [
   '#000000', // Black
   '#4361EE', // Blue
   '#2EC4B6', // Teal
   '#FF9F1C', // Orange
   '#E71D36', // Red
   '#6A0572', // Purple
   '#3A5F0B', // Green
   '#FFD700'  // Yellow
 ];
 
 // Initialize canvas
 onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvasContext.value = context;
      resizeCanvas();
      
      window.addEventListener('resize', resizeCanvas);
      
      canvasContext.value.lineCap = 'round';
      canvasContext.value.lineJoin = 'round';
      canvasContext.value.strokeStyle = selectedColor.value;
      canvasContext.value.lineWidth = lineWidth.value;
      
      canvasContext.value.fillStyle = 'white';
      canvasContext.value.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
});

// Watch for socket becoming available
watch(() => props.socket, (newSocket) => {
  if (newSocket) {
    newSocket.on('drawing', (data: { x: number; y: number; type: string }) => {
      draw(data.x, data.y, data.type);
    });

    newSocket.on('clear-canvas', () => {
      clearCanvas();
    });
  }
});

 
 // Clean up event listeners when component is unmounted
 onBeforeUnmount(() => {
   window.removeEventListener('resize', resizeCanvas);
 });
 
 // Resize canvas to fit container
 const resizeCanvas = () => {
   if (!canvasRef.value || !canvasContext.value) return;
   
   const canvas = canvasRef.value;
   const container = canvas.parentElement;
   
   if (container) {
     // Save current drawing
     const imageData = canvasContext.value.getImageData(0, 0, canvas.width, canvas.height);
     
     // Resize canvas
     canvas.width = container.clientWidth;
     canvas.height = container.clientHeight - 50; // Allow space for controls
     
     // Restore drawing if we had something
     canvasContext.value.putImageData(imageData, 0, 0);
     
     // Reset styles that get cleared on resize
     canvasContext.value.lineCap = 'round';
     canvasContext.value.lineJoin = 'round';
     canvasContext.value.strokeStyle = selectedColor.value;
     canvasContext.value.lineWidth = lineWidth.value;
     
     // Make sure background is white
     if (imageData.width === 0) {
       canvasContext.value.fillStyle = 'white';
       canvasContext.value.fillRect(0, 0, canvas.width, canvas.height);
     }
   }
 };
 
 // Handle canvas mouse/touch events
 const startDrawing = (e: MouseEvent | TouchEvent) => {
   if (!props.isDrawer || props.isPaused) return;
   
   isDrawing.value = true;
   
   const { x, y } = getEventPosition(e);
   
   // Start new path
   if (canvasContext.value) {
     canvasContext.value.beginPath();
     canvasContext.value.moveTo(x, y);
     
     // Emit drawing event
     emit('drawing', { x, y, type: 'start' });
   }
 };
 
 const stopDrawing = () => {
   if (!props.isDrawer) return;
   
   isDrawing.value = false;
   
   // Emit drawing event
   emit('drawing', { x: 0, y: 0, type: 'end' });
 };
 
 const draw = (x: number, y: number, type: string) => {
   if (!canvasContext.value) return;
   
   if (type === 'start') {
     canvasContext.value.beginPath();
     canvasContext.value.moveTo(x, y);
   } else if (type === 'move') {
     canvasContext.value.lineTo(x, y);
     canvasContext.value.stroke();
   } else if (type === 'end') {
     // End of stroke
   }
 };
 
 const handleDrawing = (e: MouseEvent | TouchEvent) => {
   if (!props.isDrawer || !isDrawing.value || props.isPaused) return;
   
   const { x, y } = getEventPosition(e);
   
   if (canvasContext.value) {
     canvasContext.value.lineTo(x, y);
     canvasContext.value.stroke();
     
     // Emit drawing event
     emit('drawing', { x, y, type: 'move' });
   }
 };
 
 // Get mouse/touch position relative to canvas
 const getEventPosition = (e: MouseEvent | TouchEvent) => {
   if (!canvasRef.value) return { x: 0, y: 0 };
   
   const canvas = canvasRef.value;
   const rect = canvas.getBoundingClientRect();
   
   let clientX, clientY;
   
   if ('touches' in e) {
     // Touch event
     clientX = e.touches[0].clientX;
     clientY = e.touches[0].clientY;
   } else {
     // Mouse event
     clientX = e.clientX;
     clientY = e.clientY;
   }
   
   return {
     x: clientX - rect.left,
     y: clientY - rect.top
   };
 };
 
 // Change drawing color
 const setColor = (color: string) => {
   selectedColor.value = color;
   
   if (canvasContext.value) {
     canvasContext.value.strokeStyle = color;
   }
 };
 
 // Change line width
 const setLineWidth = (width: number) => {
   lineWidth.value = width;
   
   if (canvasContext.value) {
     canvasContext.value.lineWidth = width;
   }
 };
 
 // Clear canvas
 const clearCanvas = () => {
   if (!canvasRef.value || !canvasContext.value) return;
   
   const canvas = canvasRef.value;
   canvasContext.value.fillStyle = 'white';
   canvasContext.value.fillRect(0, 0, canvas.width, canvas.height);
 };
 
 // Handle clear canvas button click
 const handleClearCanvas = () => {
   clearCanvas();
   emit('clear-canvas');
 };
 
 // Handle timer controls
 const handleToggleTimer = () => {
   emit('toggle-timer');
 };
 
 const handleSetRoundTime = (seconds: number) => {
   emit('set-round-time', seconds);
 };
 
 const handleRestartRound = () => {
   emit('restart-round');
 };
 
 // Handle custom word input
 const toggleCustomWordInput = () => {
   showCustomWordInput.value = !showCustomWordInput.value;
 };
 
 const handleSetCustomWord = () => {
   if (customWord.value.trim()) {
     emit('set-custom-word', customWord.value.trim());
     customWord.value = '';
     showCustomWordInput.value = false;
   }
 };
 
 // Watch for changes in isDrawer prop
 watch(() => props.isDrawer, (newValue) => {
   if (!newValue) {
     // If no longer the drawer, stop drawing
     isDrawing.value = false;
   }
 });
 
 // Watch for changes in isPaused prop
 watch(() => props.isPaused, (newValue) => {
   if (newValue) {
     // If paused, stop drawing
     isDrawing.value = false;
   }
 });
 </script>
 
 <template>
   <div class="drawing-container">
     <canvas
       ref="canvasRef"
       class="drawing-canvas"
       @mousedown="startDrawing"
       @mousemove="handleDrawing"
       @mouseup="stopDrawing"
       @mouseleave="stopDrawing"
       @touchstart="startDrawing"
       @touchmove="handleDrawing"
       @touchend="stopDrawing"
     ></canvas>
     <div class="drawing-controls" v-if="isDrawer">
       <div class="line-width-control">
         <input
           type="range"
           min="1"
           max="20"
           v-model="lineWidth"
           @input="setLineWidth(Number(lineWidth))"
         />
       </div>
       <button class="control-button" @click="handleClearCanvas">Clear</button>
       
       <button class="control-button" @click="toggleCustomWordInput">
         Set Custom Word
       </button>
       <div v-if="showCustomWordInput" class="custom-word-input">
         <input
           type="text"
           v-model="customWord"
           placeholder="Enter custom word"
           @keyup.enter="handleSetCustomWord"
         />
         <button @click="handleSetCustomWord">Set</button>
       </div>
     </div>
   </div>
 </template>
 
 <style scoped>
 .drawing-container {
   position: relative;
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   background-color: #fff;
   border-radius: 12px;
   overflow: hidden;
   box-shadow: 0 4px 6px rgba(154, 119, 135, 0.1);
   border: 1px solid #e4afb0;
 }
 
 .drawing-canvas {
   flex: 1;
   width: 100%;
   height: calc(100% - 70px);
   background-color: #fff;
   touch-action: none;
   display: block;
   margin: 0;
   padding: 0;
   border: none;
   cursor: crosshair;
 }
 
 .drawing-controls {
   display: flex;
   gap: 8px;
   height: 70px;
   padding: 12px;
   background-color: #fed7bf;
   border-top: 1px solid #e4afb0;
   display: flex;
   align-items: center;
 }
 
 .color-picker {
   display: flex;
   gap: 8px;
   background-color: #fff;
   padding: 6px;
   border-radius: 8px;
   border: 1px solid #e4afb0;
 }
 
 .color-button {
   width: 28px;
   height: 28px;
   border-radius: 50%;
   border: 2px solid transparent;
   cursor: pointer;
   transition: all 0.2s ease;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
 }
 
 .color-button:hover {
   transform: scale(1.1);
   box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
 }
 
 .color-button.active {
   border-color: #9a7787;
   transform: scale(1.1);
   box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
 }
 
 .line-width-control {
   display: flex;
   align-items: center;
   padding: 6px 12px;
 }
 
 .line-width-control input {
   width: 7rem;
   accent-color: #9a7787;
 }
 
 .control-button {
   padding: 8px 16px;
   background-color: #9a7787;
   color: white;
   border: none;
   border-radius: 8px;
   cursor: pointer;
   font-size: 14px;
   font-weight: 500;
   transition: all 0.2s ease;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
 }
 
 .control-button:hover {
   background-color: #e4afb0;
   transform: translateY(-1px);
   box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
 }
 
 .custom-word-input {
   display: flex;
   gap: 8px;
   background-color: #fff;
   padding: 6px;
   border-radius: 8px;
   border: 1px solid #e4afb0;
 }
 
 .custom-word-input input {
   padding: 8px 12px;
   border: 1px solid #e4afb0;
   border-radius: 6px;
   font-size: 14px;
   color: #9a7787;
   background-color: #fff;
   min-width: 150px;
 }
 
 .custom-word-input input:focus {
   outline: none;
   border-color: #9a7787;
 }
 
 .custom-word-input button {
   padding: 8px 16px;
   background-color: #9a7787;
   color: white;
   border: none;
   border-radius: 6px;
   cursor: pointer;
   font-size: 14px;
   font-weight: 500;
   transition: all 0.2s ease;
 }
 
 .custom-word-input button:hover {
   background-color: #e4afb0;
   transform: translateY(-1px);
 }
 
 @media (max-width: 768px) {
   .drawing-controls {
     height: auto;
     padding: 8px;
     gap: 8px;
   }
   
   .color-button {
     width: 24px;
     height: 24px;
   }
   
   .control-button {
     padding: 6px 12px;
     font-size: 12px;
   }
   
   .custom-word-input {
     width: 100%;
   }
   
   .custom-word-input input {
     flex: 1;
     min-width: 0;
   }
   
   .line-width-control {
     width: 50%;
   }
   
   .line-width-control input {
     width: 100%;
   }
 }
 </style>
<script setup lang="ts">
 import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
 import type { Socket } from 'socket.io-client';
 
 const props = defineProps<{
  isDrawer: boolean;
  socket: Socket | null;  // Not a ref anymore, just the Socket object
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
 .canvas-wrapper {
   position: relative;
   width: 100%;
   height: 100%;
   background-color: #fff;
   border-radius: 15px;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
   border: 3px solid #ffd700;
   overflow: hidden;
 }
 
 canvas {
   display: block;
   background-color: white;
   border-radius: 12px;
 }
 
 .tools {
   position: absolute;
   bottom: 20px;
   left: 20px;
   display: flex;
   gap: 10px;
   background-color: rgba(255, 255, 255, 0.9);
   padding: 10px;
   border-radius: 10px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
   border: 2px solid #ff6b6b;
 }
 
 .color-picker {
   display: flex;
   gap: 5px;
 }
 
 .color-option {
   width: 30px;
   height: 30px;
   border-radius: 50%;
   cursor: pointer;
   border: 2px solid #ffd700;
   transition: transform 0.2s ease;
 }
 
 .color-option:hover {
   transform: scale(1.1);
 }
 
 .color-option.selected {
   border: 3px solid #ff6b6b;
   transform: scale(1.1);
 }
 
 .size-control {
   display: flex;
   align-items: center;
   gap: 5px;
 }
 
 .size-control input {
   width: 100px;
   accent-color: #ff6b6b;
 }
 
 .controls {
   display: flex;
   gap: 10px;
 }
 
 button {
   padding: 8px 16px;
   border: none;
   border-radius: 8px;
   cursor: pointer;
   font-weight: bold;
   transition: all 0.3s ease;
   font-family: 'Comic Sans MS', cursive, sans-serif;
 }
 
 button:hover {
   transform: scale(1.05);
 }
 
 .clear-button {
   background-color: #ff6b6b;
   color: white;
   border: 2px solid #ffd700;
 }
 
 .custom-word-input {
   position: absolute;
   top: 20px;
   left: 20px;
   background-color: rgba(255, 255, 255, 0.9);
   padding: 10px;
   border-radius: 10px;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
   border: 2px solid #ff6b6b;
 }
 
 .custom-word-input input {
   padding: 8px;
   border: 2px solid #ffd700;
   border-radius: 5px;
   margin-right: 10px;
   font-family: 'Comic Sans MS', cursive, sans-serif;
 }
 
 .custom-word-input button {
   background-color: #4CAF50;
   color: white;
   border: 2px solid #ffd700;
 }
 </style>
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
.drawing-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4afb0;
  overflow: hidden;
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  background-color: #fff;
}

.drawing-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #fff;
  border-top: 1px solid #e4afb0;
}

.line-width-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.line-width-control input {
  width: 100px;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #e4afb0;
  transition: all 0.25s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border: 2px solid #9a7787;
}

.clear-button {
  padding: 0.5rem 1rem;
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

.clear-button:hover {
  background-color: #e4afb0;
  color: #fff;
}

.custom-word-input {
  display: flex;
  gap: 0.5rem;
}

.custom-word-input input {
  padding: 0.5rem;
  border: 1px solid #e4afb0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.25s ease;
}

.custom-word-input input:focus {
  outline: none;
  border-color: #9a7787;
}

.custom-word-input button {
  padding: 0.5rem 1rem;
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

.custom-word-input button:hover {
  background-color: #e4afb0;
  color: #fff;
}

@media (max-width: 768px) {
  .drawing-controls {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .line-width-control {
    width: 100%;
  }
  
  .color-picker {
    width: 100%;
    justify-content: space-between;
  }
  
  .custom-word-input {
    width: 100%;
  }
  
  .custom-word-input input {
    flex: 1;
  }
}
 </style>
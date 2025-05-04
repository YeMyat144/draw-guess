<script setup lang="ts">
 import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
 import type { Socket } from 'socket.io-client';
 
 const props = defineProps<{
  isDrawer: boolean;
  socket: Socket | null;
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

 // Fixed canvas dimensions
 const CANVAS_WIDTH = 800;
 const CANVAS_HEIGHT = 600;
 
 // Scale factors for coordinate mapping
 const scaleX = ref(1);
 const scaleY = ref(1);
 
 // Initialize canvas
 onMounted(() => {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');
    
    if (context) {
      canvasContext.value = context;
      
      // Set initial canvas size
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      
      // Set up canvas styles
      canvasContext.value.lineCap = 'round';
      canvasContext.value.lineJoin = 'round';
      canvasContext.value.strokeStyle = selectedColor.value;
      canvasContext.value.lineWidth = lineWidth.value;
      
      // Fill white background
      canvasContext.value.fillStyle = 'white';
      canvasContext.value.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Initial resize
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
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
 
// Clean up event listeners
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCanvas);
});
 
// Resize canvas while maintaining aspect ratio
const resizeCanvas = () => {
  if (!canvasRef.value || !canvasContext.value) return;
  
  const canvas = canvasRef.value;
  const container = canvas.parentElement;
  
  if (container) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 50; // Space for controls
    
    // Calculate scale to fit container while maintaining aspect ratio
    const containerRatio = containerWidth / containerHeight;
    const canvasRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    
    let width, height;
    if (containerRatio > canvasRatio) {
      // Container is wider than canvas ratio
      height = containerHeight;
      width = height * canvasRatio;
    } else {
      // Container is taller than canvas ratio
      width = containerWidth;
      height = width / canvasRatio;
    }
    
    // Update scale factors
    scaleX.value = CANVAS_WIDTH / width;
    scaleY.value = CANVAS_HEIGHT / height;
    
    // Set display size (CSS pixels)
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
};
 
// Convert screen coordinates to canvas coordinates
const getCanvasCoordinates = (clientX: number, clientY: number) => {
  if (!canvasRef.value) return { x: 0, y: 0 };
  
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  
  // Calculate position in CSS pixels relative to canvas
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  // Convert to canvas coordinates
  return {
    x: x * scaleX.value,
    y: y * scaleY.value
  };
};
 
// Handle canvas mouse/touch events
const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!props.isDrawer || props.isPaused) return;
  
  isDrawing.value = true;
  
  const coords = getEventCoordinates(e);
  const { x, y } = getCanvasCoordinates(coords.x, coords.y);
  
  if (canvasContext.value) {
    canvasContext.value.beginPath();
    canvasContext.value.moveTo(x, y);
    
    emit('drawing', { x, y, type: 'start' });
  }
};
 
const stopDrawing = () => {
  if (!props.isDrawer) return;
  
  isDrawing.value = false;
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
  }
};
 
const handleDrawing = (e: MouseEvent | TouchEvent) => {
  if (!props.isDrawer || !isDrawing.value || props.isPaused) return;
  
  const coords = getEventCoordinates(e);
  const { x, y } = getCanvasCoordinates(coords.x, coords.y);
  
  if (canvasContext.value) {
    canvasContext.value.lineTo(x, y);
    canvasContext.value.stroke();
    
    emit('drawing', { x, y, type: 'move' });
  }
};
 
// Get coordinates from mouse or touch event
const getEventCoordinates = (e: MouseEvent | TouchEvent) => {
  if ('touches' in e) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }
  return {
    x: e.clientX,
    y: e.clientY
  };
};
 
// Clear canvas
const clearCanvas = () => {
  if (!canvasRef.value || !canvasContext.value) return;
  
  canvasContext.value.fillStyle = 'white';
  canvasContext.value.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
    isDrawing.value = false;
  }
});
 
// Watch for changes in isPaused prop
watch(() => props.isPaused, (newValue) => {
  if (newValue) {
    isDrawing.value = false;
  }
});
</script>
 
<template>
  <div class="drawing-container">
    <div class="drawing-controls" v-if="isDrawer">
      <button class="control-button" @click="handleClearCanvas">Clear</button>
      
      <button class="control-button" @click="toggleCustomWordInput">
        Word
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
    <canvas
      ref="canvasRef"
      class="drawing-canvas"
      @mousedown="startDrawing"
      @mousemove="handleDrawing"
      @mouseup="stopDrawing"
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawing"
      @touchmove.prevent="handleDrawing"
      @touchend.prevent="stopDrawing"
    ></canvas>
  </div>
</template>
 
<style scoped>
.drawing-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #353537;
  position: relative;
}
 
.drawing-controls {
  position: absolute;
  display: flex;
  justify-content: center;
  gap: 16px;
  align-items: center;
  padding: 8px;
  background-color: #353537;
}

.drawing-canvas {
  flex: 1;
  background-color: white;
  touch-action: none;
  display: block;
  margin: 0 auto;
  padding: 0;
  border: none;
  cursor: crosshair;
}
 
.control-button {
  padding: 4px 8px;
  background-color: #6db432;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}
 
.control-button:hover {
  background-color: #8bc064;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}
 
.custom-word-input {
  display: flex;
  gap: 8px;
  background-color: #353537;
  padding: 6px;
}
 
.custom-word-input input {
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: #353537;
  background-color: #fff;
  min-width: 150px;
}
 
.custom-word-input input:focus {
  outline: none;
  border-color: #6db432;
}
 
.custom-word-input button {
  padding: 8px 16px;
  background-color: #6db432;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
 
.custom-word-input button:hover {
  background-color: #8bc064;
  transform: translateY(-1px);
}
 
@media (max-width: 768px) {
  .drawing-controls {
    height: auto;
    gap: 8px;
    padding: 8px;
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
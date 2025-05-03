<script setup lang="ts">
const props = defineProps<{
  players: { id: string; username: string; score: number; isDrawer: boolean }[];
  currentUser: string;
  isDrawer: boolean;
}>();

const emit = defineEmits(['request-drawer']);

// Request to switch the drawer role
const requestSwitchDrawer = (username: string) => {
  emit('request-drawer', username);
};

// Sort players by score (descending)
const sortedPlayers = () => {
  return [...props.players].sort((a, b) => b.score - a.score);
};


</script>

<template>
  <div class="player-list">

    
    <div class="players">
      <div 
        v-for="player in sortedPlayers()" 
        :key="player.id"
        class="player"
        :class="{ 
          'current-player': player.username === currentUser,
          'is-drawer': player.isDrawer 
        }"
      >
        <div class="player-info">
          <span class="player-name">
            {{ player.username }}
            <span v-if="player.isDrawer" class="drawer-badge">Drawing</span>
          </span>
          <span class="player-score">{{ player.score }}</span>
        </div>
        
        <button 
          v-if="isDrawer && currentUser !== player.username && !player.isDrawer"
          class="give-turn-btn"
          @click="requestSwitchDrawer(player.username)"
          title="Make this player the drawer"
        >
          <span class="give-turn-icon">↗</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-list {
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid #ffd700;
  overflow: hidden;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.player-list h3 {
  background-color: #ff6b6b;
  color: white;
  padding: 15px;
  margin: 0;
  text-align: center;
  border-bottom: 2px solid #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.players {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f0f8ff;
}

.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: white;
  border-radius: 10px;
  border: 2px solid #ffd700;
  transition: all 0.3s ease;
}

.player:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-player {
  background-color: #1e90ff;
  color: white;
  border-color: #ffd700;
}

.is-drawer {
  background-color: #ffd700;
  color: #333;
  border-color: #ff6b6b;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-name {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.drawer-badge {
  background-color: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  border: 1px solid #ffd700;
}

.player-score {
  font-weight: bold;
  color: #ff6b6b;
}

.give-turn-btn {
  padding: 6px 12px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  border: 2px solid #ffd700;
}

.give-turn-btn:hover {
  transform: scale(1.05);
  background-color: #ff8c8c;
}

.give-turn-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.give-turn-icon {
  font-size: 1rem;
  line-height: 1;
}

.give-turn-text {
  display: none;
}

@media (min-width: 768px) {
  .give-turn-text {
    display: inline;
  }
}

@media (max-width: 768px) {
  .player {
    padding: 8px 12px;
  }
  
  .player-name {
    font-size: 0.9em;
  }
  
  .player-score {
    font-size: 0.9em;
  }
  
  .give-turn-btn {
    padding: 4px 8px;
    font-size: 0.9em;
  }
}
</style>
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
  background-color: #7b7b7d;
  overflow: hidden;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-height: 80vh;
  overflow-y: auto;
}

.player-list::-webkit-scrollbar {
  width: 6px;
}
.player-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}



.players {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #353537;
}

.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #7b7b7d;
  border-radius: 10px;
  transition: all 0.25s ease;
}

.player:hover {
  background-color: #8dc064;
}

.current-player {
  background-color: #616569;
  color: white;
}

.is-drawer {
  background-color: #8dc064;
  color: white;
  border-color: #7b7b7d;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.drawer-badge {
  background-color: #6db432;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  border: 1px solid #6db432;
}

.player-score {
  font-weight: 500;
  color: white;
}

.give-turn-btn {
  padding: 2px 10px;
  background-color: #6db432;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.25s ease;
  font-family: inherit;
}

.give-turn-btn:hover {
  background-color: #7b7b7d;
  color: #fff;
}

.give-turn-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
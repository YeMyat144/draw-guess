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
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4afb0;
  overflow: hidden;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.player-list h3 {
  background-color: #fed7bf;
  color: #9a7787;
  padding: 15px;
  margin: 0;
  text-align: center;
  border-bottom: 1px solid #e4afb0;
}

.players {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #fff;
}

.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 10px;
  border: 1px solid #e4afb0;
  transition: all 0.25s ease;
}

.player:hover {
  background-color: #fed7bf;
}

.current-player {
  background-color: #fed7bf;
  color: #9a7787;
  border-color: #e4afb0;
}

.is-drawer {
  background-color: #fed7bf;
  color: #9a7787;
  border-color: #e4afb0;
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
  background-color: #fed7bf;
  color: #9a7787;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8em;
  border: 1px solid #e4afb0;
}

.player-score {
  font-weight: 500;
  color: #9a7787;
}

.give-turn-btn {
  padding: 6px 12px;
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

.give-turn-btn:hover {
  background-color: #e4afb0;
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
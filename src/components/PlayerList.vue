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
   display: flex;
   flex-direction: column;
   height: 50%;
   background-color: #fff;
 }
 
 .player-list-header {
   padding: 0.75rem 1rem;
   background-color: #fed7bf;
   border-bottom: 1px solid #e4afb0;
   display: flex;
   justify-content: space-between;
   align-items: center;
 }
 
 .player-list-header h3 {
   margin: 0;
   font-size: 1rem;
   color: #9a7787;
   font-weight: 600;
 }
 
 .drawer-controls {
   display: flex;
   align-items: center;
 }
 
 .players {
   flex: 1;
   overflow-y: auto;
   padding: 0.5rem;
   background-color: #fff;
 }
 
 .player {
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0.75rem 1rem;
   border-radius: 6px;
   margin-bottom: 0.5rem;
   background-color: #fed7bf;
   transition: all 0.2s ease;
 }
 
 .player:hover {
   background-color: #e4afb0;
   transform: translateX(4px);
 }
 
 .player.is-drawer {
   background-color: #9a7787;
   border-left: 3px solid #e4afb0;
   color: #fff;
 }
 
 .player.current-player {
   background-color: #e4afb0;
   border-left: 3px solid #9a7787;
   color: #fff;
 }
 
 .player-info {
   display: flex;
   justify-content: space-between;
   align-items: center;
   width: 100%;
 }
 
 .player-name {
   font-weight: 500;
   display: flex;
   align-items: center;
   gap: 0.5rem;
 }
 
 .drawer-badge {
   font-size: 0.7rem;
   background-color: #9a7787;
   color: white;
   padding: 0.2rem 0.4rem;
   border-radius: 4px;
 }
 
 .player-score {
   font-weight: 600;
   color: inherit;
 }
 
 .give-turn-btn {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   padding: 0.3rem 0.6rem;
   font-size: 0.8rem;
   background-color: #9a7787;
   color: white;
   border: none;
   border-radius: 4px;
   cursor: pointer;
   transition: all 0.2s;
 }
 
 .give-turn-btn:hover {
   background-color: #e4afb0;
   transform: translateY(-1px);
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
   .player-list {
     height: auto;
     min-height: 200px;
   }
   
   .player {
     padding: 0.5rem 0.75rem;
   }
 }
 </style>
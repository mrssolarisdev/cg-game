<template>
  <v-app>
    <div>
      <v-main>
        <GameScreen/>
      </v-main>
    </div> 
  </v-app>
</template>

<script>
import GameScreen from './components/GameScreen';

export default {
  name: 'App',

  components: {
    GameScreen,
  },

  data: () => ({}),
};
</script>

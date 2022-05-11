<template>
  <v-app>
    <v-main>
      <GameScreen />

    </v-main>
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

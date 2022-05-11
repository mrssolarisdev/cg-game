<template>
   <v-app>
    <v-container :width="screenWidth" :height="screenHeight" class="mt-5">
      <v-row align="center">
        <GameCanvas v-bind="canvasAttributes"/>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import GameCanvas from './GameCanvas.vue';
  export default {
    name: "GameScreen",
    data: () => ({
      screenWidth: window.innerWidth - 20,
      screenHeight: window.innerHeight - 20
    }),
    components: { GameCanvas },
    computed: {
      canvasAttributes() {
        return {
          border: '1px solid #ccc',
          backgroundColor: 'black'
        }
      }
    }
}
</script>
<style>
</style>
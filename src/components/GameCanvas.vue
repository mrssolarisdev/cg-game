<template>
  <v-container>
    <canvas id="myCanvas" :style="`border: ${border}; background: ${backgroundColor}; width: inherit; height: inherit`"></canvas>
  </v-container>
</template>

<script>
  export default {
    name: 'GameScreen',
    props: {
        border: {
            required: false,
            default: '1px solid red',
            type: String
        },
        backgroundColor: {
            required: false,
            default: 'black',
            type: String
        }
    },
    data: () => ({}),
    created (){
        this.loop()
    },
    methods: {
        loop() {
            console.log('loop')
            this.updateGame()
            this.render()
            window.requestAnimationFrame(this.loop)
        },
        updateGame(){
            console.log('update')
        },
        render(){
            console.log('rendering')
        }
    }
  }
</script>

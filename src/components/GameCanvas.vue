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
    },
    methods: {

    }
  }
</script>

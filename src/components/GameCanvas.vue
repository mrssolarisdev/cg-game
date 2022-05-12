<template>
  <v-container>
      <div :style="`width: 30px; height: 30px; position: relative; background: red; top: ${foesStates.foe1.x/25}px;`"></div>
    <canvas id="myCanvas" :style="`border: ${border}; background: ${backgroundColor}; width: inherit; height: inherit`"></canvas>
  </v-container>
</template>

<script>

  export default {
    name: 'GameCanvas',
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
    data: () => ({
        lastRender: null,
        foesStates: {
            foe1: {x: 40, y: 40}
        },
    }),
    created (){
        // Solicita que o navegador execute essa função assim que possível, mas antes da próxima renderização de tela.
        window.requestAnimationFrame(this.loop)
    },
    methods: {
        /* Função gameloop. Recebe uma timestamp através da função de requisição de frame do DOM, executada na criação do componente GameCanvas.
        Essa função executa outras três: update (responsável por atualizar o estado dos elementos do jogo), render (renderiza os elementos do jogo com base nos estados
        atualizados pela função anterior, update) e requestAnimationFrame, que, dentro da função loop é executada novamente, recebendo como callback a própria função loop,
        a rodando novamente para o próximo frame solicitado ao navegador. */
        loop(timestamp) {
            let elapsedTime = timestamp - this.lastRender
            console.log('loop', timestamp)
            this.update(elapsedTime)
            this.render()
            this.lastRender = timestamp
            window.requestAnimationFrame(this.loop)
        },
        update(timestamp){
            for (const [_, states] of Object.entries(this.foesStates)) {
                console.log(states, _);
                states.x += timestamp
                states.y += timestamp
            }
            console.log('update', timestamp, this.foesStates)
        },
        render(){
            console.log('rendering')
        }
    }
  }
</script>

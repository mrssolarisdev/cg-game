<template>
  <v-container>
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
        gameCanvas: null,
        pressedKey: null,
        dinoStates: {
            posX: 0,
            posY: 0,
            velX: 5,
            velY: 5,
            size: 50
        },
        movements: {
            up: null,
            down: null,
            left: null,
            right: null,
            special: null
        }
    }),
    created (){
        // Solicita que o navegador execute essa função assim que possível, mas antes da próxima renderização de tela.
        window.requestAnimationFrame(this.loop)
    },
    mounted() {
        this.gameCanvas = document.getElementById('myCanvas')
        document.addEventListener('keydown', e => this.pressedKey = e.key)
    },
    methods: {
        /* Função gameloop. Recebe uma timestamp através da função de requisição de frame do DOM, executada na criação do componente GameCanvas.
        Essa função executa outras três: update (responsável por atualizar o estado dos elementos do jogo), render (renderiza os elementos do jogo com base nos estados
        atualizados pela função anterior, update) e requestAnimationFrame, que, dentro da função loop é executada novamente, recebendo como callback a própria função loop,
        a rodando novamente para o próximo frame solicitado ao navegador. */
        loop(timestamp) {
            let elapsedTime = timestamp - this.lastRender
            console.log('loop', timestamp)
            this.handleEvents()
            this.update(elapsedTime)
            this.render()
            this.lastRender = timestamp
            window.requestAnimationFrame(this.loop)
        },
        handleEvents() {
            console.log('tecla pressionada', this.pressedKey)
            switch(this.pressedKey) {
                case ('w'): case ('ArrowUp'): case ('8'): 
                    this.clearMovementsSet()
                    this.movements.up = true
                    break
                case ('a'): case ('ArrowLeft'): case ('4'): 
                    this.clearMovementsSet()
                    this.movements.left = true
                    break
                case ('s'): case ('ArrowDown'): case ('2'): 
                    this.clearMovementsSet()
                    this.movements.down
                    break
                case ('d'): case ('ArrowRight'): case ('6'): 
                    this.clearMovementsSet()
                    this.movements.right 
                    break
            }
            this.pressedKey = null
        },
        update(timestamp){
            this.dinoStates.posX += this.dinoStates.velX
            this.dinoStates.posY += this.dinoStates.velY
            console.log('update', timestamp, this.dinoStates.posX, this.dinoStates.posY)
        },
        render() {
            let ctx = this.gameCanvas.getContext('2d')
            ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
            ctx.fillStyle = 'pink'
            ctx.fillRect(this.dinoStates.posX, this.dinoStates.posY, this.dinoStates.size, this.dinoStates.size)
            console.log('rendering', this.gameCanvas)
        },
        clearMovementsSet() {
            this.movements = {up: null, down: null, left: null, right: null, special: null}
        }
    }
  }
</script>

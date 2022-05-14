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
        pressedKeys: new Set(),
        pressedKeyEvent: null,
        dinoStates: {
            posX: 0,
            posY: 0,
            velX: 5,
            velY: 5,
            size: 50
        },
        movements: {
            up: false,
            down: false,
            left: false,
            right: false,
            special: false
        }
    }),
    created (){
        // Solicita que o navegador execute essa função assim que possível, mas antes da próxima renderização de tela.
        window.requestAnimationFrame(this.loop)
    },
    mounted() {
        this.gameCanvas = document.getElementById('myCanvas')
        document.addEventListener('keydown', e => {this.pressedKeys.add(e.code)})
    },
    methods: {
        /* Função gameloop. Recebe uma timestamp através da função de requisição de frame do DOM, executada na criação do componente GameCanvas.
        Essa função executa outras três: update (responsável por atualizar o estado dos elementos do jogo), render (renderiza os elementos do jogo com base nos estados
        atualizados pela função anterior, update) e requestAnimationFrame, que, dentro da função loop é executada novamente, recebendo como callback a própria função loop,
        a rodando novamente para o próximo frame solicitado ao navegador. */
        loop(timestamp) {
            let elapsedTime = timestamp - this.lastRender
            //console.log('loop', timestamp)
            this.handleEvents()
            this.update(elapsedTime)
            this.render()
            this.lastRender = timestamp
            window.requestAnimationFrame(this.loop)
        },
        handleEvents() {
            if(this.isItPressed('w') || this.isItPressed('ArrowUp') | this.isItPressed('8')) {
                this.movements.up = true
                if(this.isItPressed('a') || this.isItPressed('ArrowLeft') | this.isItPressed('4')) {
                    this.movements.left = true
                }
                if(this.isItPressed('d') || this.isItPressed('ArrowRight') | this.isItPressed('6')) {
                    this.movements.right = true
                }
            }
            if(this.isItPressed('a') || this.isItPressed('ArrowLeft') | this.isItPressed('4')) {
                this.movements.left = true
                if(this.isItPressed('w') || this.isItPressed('ArrowUp') | this.isItPressed('8')) {
                    this.movements.up = true
                }
                if(this.isItPressed('s') || this.isItPressed('ArrowDown') | this.isItPressed('2')) {
                    this.movements.down = true
                }
            }
            if(this.isItPressed('s') || this.isItPressed('ArrowDown') | this.isItPressed('2')) {
                this.movements.down = true
                if(this.isItPressed('a') || this.isItPressed('ArrowLeft') | this.isItPressed('4')) {
                    this.movements.left = true
                }
                if(this.isItPressed('d') || this.isItPressed('ArrowRight') | this.isItPressed('6')) {
                    this.movements.right = true
                }
            }
            if(this.isItPressed('d') || this.isItPressed('ArrowRight') | this.isItPressed('6')) {
                this.movements.right = true
                if(this.isItPressed('w') || this.isItPressed('ArrowUp') | this.isItPressed('8')) {
                    this.movements.up = true
                }
                if(this.isItPressed('s') || this.isItPressed('ArrowDown') | this.isItPressed('2')) {
                    this.movements.down = true
                }
            }
            this.pressedKeys.clear()
        },
        update(){
            /* Essas checagens foram feitas aqui para evitar realizar a alteração do estado do dinossauro no handleEvents, já que a única responsabilidade que esse
            método deve ter é atualizar as estruturas responsáveis por ditar que teclas estão sendo pressionadas no momento, nada mais.
            Foram usadas estruturas if ao invés de else if para que se fosse possível realizar mais de uma movimentação simultâneamente.*/

            // TODO: Na versão final esses updates de posicionamento vão ser responsáveis por mover o cenário (não o personagem) e por mudar os sprites no momento.
            if (this.movements.up) {
                this.dinoStates.posY -= this.dinoStates.velY
                this.movements.up = false
            }
            // TODO: aplicar ou não aplicar movimentação pra baixo a depender da mecânica escolhida.
            if (this.movements.down) {
                this.dinoStates.posY += this.dinoStates.velY
                this.movements.down = false
            }
            if (this.movements.left) {
                this.dinoStates.posX -= this.dinoStates.velX
                this.movements.left = false
            }
            if (this.movements.right) {
                this.dinoStates.posX += this.dinoStates.velX
                // Desliga o movimento para a direita uma vez que a movimentação já foi feita. Se a tratativa não fosse feita, o personagem iria para a direita pra sempre.
                this.movements.right = false
            }
            //console.log('update', timestamp, this.dinoStates.posX, this.dinoStates.posY)
        },
        render() {
            let ctx = this.gameCanvas.getContext('2d')
            ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
            ctx.fillStyle = 'pink'
            ctx.fillRect(this.dinoStates.posX, this.dinoStates.posY, this.dinoStates.size, this.dinoStates.size)
            //console.log('rendering', this.gameCanvas)
        },
        clearMovementsSet() {
            this.movements = {up: null, down: null, left: null, right: null, special: null}
        },
        isItPressed(key) {
            return this.pressedKeys.has(key)
        }
    }
  }
</script>

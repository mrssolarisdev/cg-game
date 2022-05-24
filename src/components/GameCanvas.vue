<template>
  <v-container>
    <canvas id="myCanvas" class="gameCanvas" :style="`border: ${border}; background: ${backgroundColor};`" v-bind="getCanvasDimensions"></canvas>
  </v-container>
</template>

<script>
import gameBg from "../assets/img/game_bg.webp";
import dino from "../assets/img/dino_sprite.png";

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
        gameBackground: null,
        pressedKeys: new Set(),
        pressedKeyEvent: null,
        bgStates: {
            posX: 0,
            posY: 0,
            velX: 15,
            velY: 5,
            size: 50
        },
        movements: {
            up: false,
            down: false,
            left: false,
            right: false,
            special: false
        },
        dinoCharacter: null,
        dinoCharacterData: {
            dinoCharacter: null,
            sprite: dino,
            dimensions: {
                x: 1350, // Largura do sprite.
                y: 134, // Altura do sprite.
                columnCount: 10, // Quantidade de dinossauros do sprite.
                topDinoPadding: 21, // Padding entre o topo da imagem e o começo da cabeça do dinossauro.
                leftDinoPadding: 43.5, // 43.5 de padding entre cada dinossauro.
                currentDino: null, // Dinossauro atual dentre os possíveis dinossauros.
                currentDinoIndex: null, // Index atual representando o dinossauro da iamgem.
                dinoWidth: 85, // Largura do dinossauro, o quão gordinho ele é.
                dinoHeight: 97, // Altura do dinossauro. 
            }
        }
    }),
    computed: {
        getCanvasDimensions() {
            return {width: 1750, height: 900 }
        },
        // Fiz essa computed pra não precisar escrever tanto e deixar o código menos poluido. Mas retorna o mesmo dado.
        dinoDimensions() {
            return this.dinoCharacterData.dimensions
        }
    },
    created (){
        // Solicita que o navegador execute essa função assim que possível, mas antes da próxima renderização de tela.
        window.requestAnimationFrame(this.loop)
    },
    mounted() {
        this.dinoCharacter = new Image()
        this.dinoCharacter.src = this.dinoCharacterData.sprite
        this.dinoCharacter.width = this.dinoCharacterData.x
        this.dinoCharacter.height = this.dinoCharacterData.y
        this.gameBackground = new Image()
        this.gameBackground.src = gameBg
        this.gameCanvas = document.getElementById('myCanvas')
        document.addEventListener('keydown', e => {e.preventDefault(); this.pressedKeys.add(e.code)})
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
                this.bgStates.posY -= this.bgStates.velY
                this.movements.up = false
            }
            // TODO: aplicar ou não aplicar movimentação pra baixo a depender da mecânica escolhida.
            // if (this.movements.down) {
            //     this.bgStates.posY += this.bgStates.velY
            //     this.movements.down = false
            // }
            if (this.movements.left) {
                this.bgStates.posX += this.bgStates.velX
                this.movements.left = false
            }
            if (this.movements.right) {
                // Movimento é invertido para que o background se mova para trás e dê a sensaçao de movimento.
                this.bgStates.posX -= this.bgStates.velX
                // Desliga o movimento para a direita uma vez que a movimentação já foi feita. Se a tratativa não fosse feita, o personagem iria para a direita pra sempre.
                this.movements.right = false
            }
            //console.log('update', timestamp, this.bgStates.posX, this.bgStates.posY)
        },
        render() {
            let ctx = this.gameCanvas.getContext('2d')
            ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
            // Impede a imagem de sofer smoothing pelo mecanismo de renderização do browser. Melhora a nitidez.
            ctx.imageSmoothingEnabled = false;
            /* Colocar uma nova imagem logo depois da outra ao invés de retira-la do canvas antes de criar outra ou somente
            mudar seus atributos de posição não vai criar uma bagunça de memória, uma vez que o canvas não guarda a referência
            para a imagem colocada nele como aconteceria com qualquer outro elemento do DOM. Uma vez que a imagem é desenhada no 
            canvas, ela vira somente uma sequência de pixels para os quais não se tem referência.
            obs: a função clearRect limparia somente o que está dentro da area do canvas, o que deixa de ser verdade quando a imagem
            sai dele.
            */
            ctx.drawImage(this.gameBackground, this.bgStates.posX, 0, this.gameCanvas.width, this.gameCanvas.height);
            if(this.bgStates.posX < 0) {
                ctx.drawImage(this.gameBackground, this.bgStates.posX + this.gameCanvas.width, 0, this.gameCanvas.width, this.gameCanvas.height);
            }
            if (this.bgStates.posX + this.gameCanvas.width < 0) {
                this.bgStates.posX += this.gameCanvas.width
                ctx.drawImage(this.gameBackground, this.bgStates.posX + this.gameCanvas.width, 0, this.gameCanvas.width, this.gameCanvas.height);
            }
            //this.renderDino(1)
        },
        renderDino(dinoIndex) {
            dinoIndex -= 1
            let listaFrames = []
            this.dinoDimensions.currentDinoIndex = dinoIndex
            // Se forem as ultimas 6 imagens, o padding pode diminuir um pouco pra melhorar o corte
            // as 4 primeiras imagens são em idle, as outras são de corrida
            for (let i = 0; i < 1; i++) {
                for (let j = 0; j < this.dinoDimensions.columnCount; j++) {
                    let x1 = this.dinoDimensions.leftDinoPadding + (this.dinoDimensions.dinoWidth * j) + (this.dinoDimensions.leftDinoPadding * j)
                    let y1 = this.dinoDimensions.topDinoPadding + (this.dinoDimensions.dinoHeight * i)
                    listaFrames[i*this.dinoDimensions.columnCount + j] = {x1, y1}
                }
            }
            this.dinoDimensions.currentDino = listaFrames[this.dinoDimensions.currentDinoIndex]
            // ir incrementando o indexAtual a cada quadro
            let ctx = this.gameCanvas.getContext('2d')
            //ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
            /* 
                imagem a ser desenhada, 
                posicao em x do começo do corte da imagem
                posicao em y do começo do corte da imagem
                largura em x do corte na imagem
                largura em y do corte na imagem
                posicao x da imagem resultado no canvas
                posicao y da imagem resultado no canvas
                largura da imagem
                altura da imagem
            */
            console.log(this.dinoCharacter, this.dinoDimensions.currentDino.x1, this.dinoDimensions.currentDino.y1, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight, 0, 800, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight)
            ctx.drawImage(this.dinoCharacter, this.dinoDimensions.currentDino.x1, this.dinoDimensions.currentDino.y1, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight, 0, 800, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight);
            
        },
        clearMovementsSet() {
            this.movements = {...this.movements, up: null, down: null, left: null, right: null, special: null}
        },
        isItPressed(key) {
            return this.pressedKeys.has(key)
        }
    }
  }
</script>
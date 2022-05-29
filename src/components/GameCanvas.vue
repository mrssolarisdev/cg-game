<template>
  <v-container>
    <canvas id="myCanvas" class="gameCanvas" :style="`border: ${border}; background: ${backgroundColor};`" v-bind="getCanvasDimensions"></canvas>
  </v-container>
</template>

<script>
import gameBg from "../assets/img/game_bg.webp";
import dino from "../assets/img/dino_sprite.png";
import bird from "../assets/img/bird_cut.png";
import rock from "../assets/img/rock.png";

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
        gameCanvasContext: null,
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
            none: false,
            special: false
        },
        dinoCharacter: null,
        dinoCharacterData: {
            dinoCharacter: null,
            sprite: dino,
            frameCounter: 0,
            dimensions: {
                x: 1350, // Largura do sprite.
                y: 134, // Altura do sprite.
                columnCount: 10, // Quantidade de dinossauros do sprite.
                topDinoPadding: 21, // Padding entre o topo da imagem e o começo da cabeça do dinossauro.
                leftDinoPadding: 44, // 43.5 de padding entre cada dinossauro.
                currentDino: null, // Dinossauro atual dentre os possíveis dinossauros.
                lastMode: "iddle",
                currentDinoIndex: 3, // Index atual representando o dinossauro da iamgem.
                dinoWidth: 85, // Largura do dinossauro, o quão gordinho ele é.
                dinoHeight: 97, // Altura do dinossauro. 
                endIdleStateIndex: 3, // Índice do último sprite da animação de iddle.
                endRunningStateIndex: 9, // Índice do último sprite da animação de corrida.
                lastDinoPosition: null,
            }
        },
        obstacles: {
            birdy: {
                image: bird,
                posX: 0,
                posY: 0,
                width: 150,
                height: 378,
                isRendered: false,
            },
            rock: {
                image: rock,
                posX: 0,
                posY: 0,
                width: 505,
                height: 378,
                currentWidth: 0,
                currentHeight: 0,
                isRendered: false,
                randomPosX: 0
            }
        },
        shoudDinoMoveItself: false,
        crtDinoState: "",
        bgResetOcurred: false
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
        this.gameCanvasContext = this.gameCanvas.getContext('2d')
        document.addEventListener('keydown', e => {e.preventDefault(); this.pressedKeys.add(e.code);})
        document.addEventListener('keyup', e => {e.preventDefault(); this.pressedKeys.delete(e.code);})
        this.obstacles.birdy.posY = Math.round((this.gameCanvas.height - 305) * Math.random())
        this.obstacles.rock.randomPosX = Math.round(this.obstacles.rock.width * Math.random())
    },
    methods: {
        /* Função gameloop. Recebe uma timestamp através da função de requisição de frame do DOM, executada na criação do componente GameCanvas.
        Essa função executa outras três: update (responsável por atualizar o estado dos elementos do jogo), render (renderiza os elementos do jogo com base nos estados
        atualizados pela função anterior, update) e requestAnimationFrame, que, dentro da função loop é executada novamente, recebendo como callback a própria função loop,
        a rodando novamente para o próximo frame solicitado ao navegador. */
        loop(timestamp) {
            let elapsedTime = timestamp - this.lastRender
            this.handleEvents(elapsedTime)
            this.update()
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
            else if (this.pressedKeys.size <= 0) {
                this.movements.none = true
            }
        },
        update(){
            /* Essas checagens foram feitas aqui para evitar realizar a alteração do estado do dinossauro no handleEvents, já que a única responsabilidade que esse
            método deve ter é atualizar as estruturas responsáveis por ditar que teclas estão sendo pressionadas no momento, nada mais.
            Foram usadas estruturas if ao invés de else if para que se fosse possível realizar mais de uma movimentação simultâneamente.*/
            
            // TODO: Na versão final esses updates de posicionamento vão ser responsáveis por mover o cenário (não o personagem) e por mudar os sprites no momento.
            if (this.movements.up) {
                this.bgStates.posY -= this.bgStates.velY
            }
            if (this.movements.right) {
                // Por enquanto ele só vai se mover para a direita. Essa flag indica para a função render que o dinossauro pode animar.
                this.shoudDinoMoveItself = true
                this.crtDinoState = "move"
                // Movimento é invertido para que o background se mova para trás e dê a sensaçao de movimento.
                this.bgStates.posX -= this.bgStates.velX
                // Desliga o movimento para a direita uma vez que a movimentação já foi feita. Se a tratativa não fosse feita, o personagem iria para a direita pra sempre.
            }
            if (!this.movements.up && !this.movements.right) {
                this.shoudDinoMoveItself = true
                this.crtDinoState = "iddle"  
            }
            this.clearMovementsSet()
        },
        render() {
            let ctx = this.gameCanvas.getContext('2d')
            ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height)
            // Impede a imagem de sofer smoothing pelo mecanismo de renderização do browser. Melhora a nitidez.
            ctx.imageSmoothingEnabled = false;
            this.dinoCharacterData.frameCounter++
            if (this.bgResetOcurred) {
                this.bgResetOcurred = false
            }
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
                this.bgResetOcurred = true
                ctx.drawImage(this.gameBackground, this.bgStates.posX + this.gameCanvas.width, 0, this.gameCanvas.width, this.gameCanvas.height);
            }
            this.renderDino(this.crtDinoState)
            // Renderiza os inimigos que virerem depois, por cima
            this.renderObstacles()
        },
        renderDino(mode = "iddle") {
            if(this.dinoCharacterData.lastMode != mode) {
                this.dinoCharacterData.lastMode = mode
                if(mode == "iddle") {
                    this.dinoDimensions.currentDinoIndex = 0
                }
                else if(mode == "move") {
                    this.dinoDimensions.currentDinoIndex = 4
                }
            }
            let spriteInterval = 0
            let listaFrames = []    

            switch (mode) {
                case "move":
                    spriteInterval = 20
                    break
                case "iddle":
                    spriteInterval = 10
            }
            if (this.shoudDinoMoveItself && this.dinoCharacterData.frameCounter > spriteInterval) {
                this.dinoDimensions.currentDinoIndex++
                this.shoudDinoMoveItself = false
                this.dinoCharacterData.frameCounter = 1
            }
            if (this.dinoDimensions.currentDinoIndex >= this.dinoDimensions.endRunningStateIndex && mode == "move") {
                // Volta pra um index anterior ao de onde se deve começar a animação de corrida.
                this.dinoDimensions.currentDinoIndex = 4
            }
            if (this.dinoDimensions.currentDinoIndex >= this.dinoDimensions.endIdleStateIndex && mode == "iddle") {
                // Volta pra um index anterior ao de onde se deve começar a animação de iddle.
                this.dinoDimensions.currentDinoIndex = 0
            }
            // Se forem as ultimas 6 imagens, o padding pode diminuir um pouco pra melhorar o corte
            // as 4 primeiras imagens são em idle, as outras são de corrida
            // Só tem um for pq o sprite so tem uma linha
            for (let j = 0; j < this.dinoDimensions.columnCount; j++) {
                let x1 = this.dinoDimensions.leftDinoPadding + (this.dinoDimensions.dinoWidth * j) + (this.dinoDimensions.leftDinoPadding * j)
                let y1 = this.dinoDimensions.topDinoPadding + (this.dinoDimensions.dinoHeight * 0)
                listaFrames[0 * this.dinoDimensions.columnCount + j] = {x1, y1}
            }
            this.dinoDimensions.currentDino = listaFrames[this.dinoDimensions.currentDinoIndex]
            // ir incrementando o indexAtual a cada quadro
            let ctx = this.gameCanvas.getContext('2d')
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
            ctx.drawImage(this.dinoCharacter, this.dinoDimensions.currentDino.x1, this.dinoDimensions.currentDino.y1, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight, 0, 595, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight);
        },

        renderObstacles(){
            this.obstacles.birdy.posX = this.bgStates.posX + (this.gameCanvas.width - 10)
            if (this.bgResetOcurred) {
                this.obstacles.birdy.posY = Math.round((this.gameCanvas.height - 305) * Math.random())
                console.log('y: ' , this.obstacles.birdy.posY)
                this.obstacles.birdy.currentWidth = Math.round(this.obstacles.birdy.width * Math.random())
                this.obstacles.rock.randomPosX = Math.round(this.obstacles.rock.width * Math.random())
            }
            this.gameCanvasContext.fillStyle = 'red'
            this.gameCanvasContext.fillRect(this.obstacles.birdy.posX, this.obstacles.birdy.posY, 150, 80); 

            this.obstacles.rock.posX = this.bgStates.posX + (this.gameCanvas.width - 10)
            this.obstacles.rock.posY = 610
            this.obstacles.rock.posX += this.obstacles.rock.randomPosX

            this.gameCanvasContext.fillStyle = 'blue'
            this.gameCanvasContext.fillRect(this.obstacles.rock.posX, this.obstacles.rock.posY, 150, 80); 

            //console.log('aconteceu reset', this.obstacles.birdy.posX, this.bgStates.posX + (this.gameCanvas.width))
            //this.gameCanvasContext.drawImage(this.obstacles.birdy.image, positionX, this.dinoDimensions.currentDino.y1, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight, 0, 595, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight);
        },
        
        clearMovementsSet() {
            this.movements = {up: false, down: false, left: false, right: false, special: false}
        },
        isItPressed(key) {
            return this.pressedKeys.has(key)
        }
    }
  }
</script>
<template>
<v-container>
  <canvas id="myCanvas" class="gameCanvas" :style="`border: ${border}; background: ${backgroundColor};`" v-bind="getCanvasDimensions"></canvas>
</v-container>
</template>

<script>
import gameBg from "../assets/img/game_bg.webp";
import bird from "../assets/img/bird_cut.png";
import rock from "../assets/img/rock.png";
import heart from "../assets/img/heart.png";
import star from "../assets/img/star.png";

// Mixins - Os métodos nesses mixins podem ser usados referenciados usando o 'this' nesse componente, como se eles fossem seus (desde que sendo importados aqui).
import { dinoData } from '@/mixins/dinoData.js'
import { obstaclesData } from '@/mixins/obstaclesData.js'

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
  mixins: [dinoData, obstaclesData],
  data: () => ({
      loopCount: 0,
      points: 0,
      floorLevel: 595,
      lastRender: null,
      gameCanvas: null,
      gameCanvasContext: null,
      gameBackground: null,
      pressedKeys: new Set(),
      pressedKeyEvent: null,
      bgStates: {
        prevPosX: 0,
        prevPosY: 0,
        posX: 0,
        posY: 0,
        velX: 15,
        velY: 5,
        startingVelX: 15,
        startingVelY: 5,
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
      heart: {
        image: null,
        posX: 25,
        posY: 25,
        width: 48,
        height: 48,
        randomPosX: 0
      },
      bgResetOcurred: false
  }),
  computed: {
      getCanvasDimensions() {
          return {width: 1750, height: 900 }
      },
  },
  created (){
      // Solicita que o navegador execute essa função assim que possível, mas antes da próxima renderização de tela.
      window.requestAnimationFrame(this.loop)
  },
  mounted() {
    this.setupImages()
    this.gameCanvas = document.getElementById('myCanvas')
    this.gameCanvasContext = this.gameCanvas.getContext('2d')
    document.addEventListener('keydown', e => { this.pressedKeys.add(e.code);})
    document.addEventListener('keyup', e => { this.pressedKeys.delete(e.code);})
    this.obstacles.birdy.posY = Math.round((this.gameCanvas.height - 305) * Math.random())
    //this.setBirdyRandomHeight()
    this.resetObstacle(this.obstacles.star)
    this.resetObstacle(this.obstacles.rock)
    this.resetObstacle(this.obstacles.birdy)
    this.preventOverlappingObstacles()
    this.obstacles.rock.posY = 630
    this.obstacles.star.posY = 615
    this.dinoCharacterData.posX = 50
    this.dinoCharacterData.posY = this.floorLevel
  },
  methods: {
      /* Função gameloop. Recebe uma timestamp através da função de requisição de frame do DOM, executada na criação do componente GameCanvas.
      Essa função executa outras três: update (responsável por atualizar o estado dos elementos do jogo), render (renderiza os elementos do jogo com base nos estados
      atualizados pela função anterior, update) e requestAnimationFrame, que, dentro da função loop é executada novamente, recebendo como callback a própria função loop,
      a rodando novamente para o próximo frame solicitado ao navegador. */
      loop(timestamp) {
          this.handleEvents()
          this.update()
          this.render()
          this.lastRender = timestamp
          this.loopCount++
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
          if(this.dinoCharacterData.isDead) this.updateWhenDead()
          else this.regularUpdate()
      },

      // Rotina de update para quando o jogador (dino) estiver vivo
      regularUpdate() {
        /* Essas checagens foram feitas aqui para evitar realizar a alteração do estado do dinossauro no handleEvents, já que a única responsabilidade que esse
          método deve ter é atualizar as estruturas responsáveis por ditar que teclas estão sendo pressionadas no momento, nada mais.
          Foram usadas estruturas if ao invés de else if para que se fosse possível realizar mais de uma movimentação simultâneamente.*/
          
          // TODO: Na versão final esses updates de posicionamento vão ser responsáveis por mover o cenário (não o personagem) e por mudar os sprites no momento.
          if (this.movements.up && this.dinoCharacterData.jump.isJumping == false) {
              this.dinoCharacterData.jump.isJumping = true
              this.shoudDinoMoveItself = true
              this.crtDinoState = "move"
              //this.bgStates.posY -= this.bgStates.velY
          }
          if (this.movements.right) {
              // Por enquanto ele só vai se mover para a direita. Essa flag indica para a função render que o dinossauro pode animar.
              this.shoudDinoMoveItself = true
              this.crtDinoState = "move"
              // Movimento é invertido para que o background se mova para trás e dê a sensaçao de movimento.
              this.updateBgPosition({moveX: -this.bgStates.velX})
              // Desliga o movimento para a direita uma vez que a movimentação já foi feita. Se a tratativa não fosse feita, o personagem iria para a direita pra sempre.
              this.moveObstacle(this.obstacles.birdy)
              this.moveObstacle(this.obstacles.rock)
              this.moveObstacle(this.obstacles.star)
          }
          if (!this.movements.up && !this.movements.right) {
              this.shoudDinoMoveItself = true
              this.crtDinoState = "idle"  
          }

          if(this.bgStates.posX + this.gameCanvas.width < 0)
            this.points++

          if(this.dinoCharacterData.jump.isJumping == true) this.playerJump()
          
          this.checkCollision(this.obstacles.birdy)
          this.checkCollision(this.obstacles.rock)
          this.checkCollision(this.obstacles.star)

          this.checkObstaclePosition(this.obstacles.birdy)
          this.checkObstaclePosition(this.obstacles.rock)
          this.checkObstaclePosition(this.obstacles.star)

          this.preventOverlappingObstacles()

          this.updateSpeed()

          this.clearMovementsSet()
      },

      updateWhenDead() {
        // CODIGO DE UPDATE PARA QUANDO O DINO ESTIVER MORTO AQUI
      },

      render() {
        this.regularRender()
        if(this.dinoCharacterData.isDead) this.renderWhenDead()
      },

      regularRender() {
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
              this.updateBgPosition({moveX: this.gameCanvas.width})
              this.bgResetOcurred = true
              ctx.drawImage(this.gameBackground, this.bgStates.posX + this.gameCanvas.width, 0, this.gameCanvas.width, this.gameCanvas.height);
          }
          // Renderiza os inimigos que vierem depois, por baixo do dino
          this.renderObstacles()
          // Renderiza o dino
          this.renderDino(this.crtDinoState)
          // Finalmente, renderiza os corações da vida do dino
          this.renderHearts()

          this.renderPoints(this.points)
      },

      renderWhenDead() {
        const ctx = this.gameCanvasContext
        const textString = "You Lose!"
        const textWidth = ctx.measureText(textString).width
        ctx.font = "bolder 64px Roboto"
        ctx.fillText(textString, this.gameCanvas.width / 2 - textWidth / 2, this.gameCanvas.height / 2);
      },

      renderDino(mode = "idle") {
          if(this.dinoCharacterData.lastMode != mode) {
              this.dinoCharacterData.lastMode = mode
              if(mode == "idle") {
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
              case "idle":
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
          if (this.dinoDimensions.currentDinoIndex >= this.dinoDimensions.endIdleStateIndex && mode == "idle") {
              // Volta pra um index anterior ao de onde se deve começar a animação de idle.
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
          ctx.drawImage(this.dinoCharacter, this.dinoDimensions.currentDino.x1,
          this.dinoDimensions.currentDino.y1, this.dinoDimensions.dinoWidth,
          this.dinoDimensions.dinoHeight, this.dinoCharacterData.posX,
          this.dinoCharacterData.posY, this.dinoDimensions.dinoWidth, this.dinoDimensions.dinoHeight)
      },

      moveObstacle(obstacle) {
        const xToMove = this.bgStates.prevPosX - this.bgStates.posX
        obstacle.posX -= xToMove
      },

      checkObstaclePosition(obstacle) {
        if(obstacle.posX < 0 - obstacle.width) {
          this.resetObstacle(obstacle)
        }
      },

      resetObstacle(obstacle) {
        const canvasDim = this.getCanvasDimensions
        const rand = Math.round(1000 * Math.random())
        obstacle.posX = canvasDim.width + obstacle.posX + rand
        obstacle.hitDino = false
        if(obstacle.birdy)
          this.setBirdyRandomHeight()
      },

      preventOverlappingObstacles() {
        let minimumDiff = 250
        // Impedir pássaro e pedra de aparecerem perto demais um do outro
        if(this.obstacles.rock.posX > this.obstacles.birdy.posX) {
          const diff = this.obstacles.rock.posX - this.obstacles.birdy.posX
          if(diff < minimumDiff)
          this.obstacles.rock.posX += minimumDiff - diff + (50*Math.random())
        } else {
          const diff = this.obstacles.birdy.posX - this.obstacles.rock.posX
          if(diff < minimumDiff)
          this.obstacles.birdy.posX += minimumDiff - diff + (50*Math.random())
        }

        minimumDiff = 100
        // Impedir estrela de sobrepor com pedra
        if(this.obstacles.star.posX > this.obstacles.rock.posX) {
          const diff = this.obstacles.star.posX - this.obstacles.rock.posX
          if(diff < minimumDiff)
          this.obstacles.star.posX += minimumDiff - diff + (50*Math.random())
        } else {
          const diff = this.obstacles.rock.posX - this.obstacles.star.posX
          if(diff < minimumDiff)
          this.obstacles.rock.posX += minimumDiff - diff + (50*Math.random())
        }

      },

      renderObstacles(){
          this.gameCanvasContext.drawImage(
            this.obstacles.birdy.image,
            this.obstacles.birdy.posX,
            this.obstacles.birdy.posY,
            this.obstacles.birdy.width,
            this.obstacles.birdy.height
          )

          this.gameCanvasContext.drawImage(
            this.obstacles.rock.image,
            this.obstacles.rock.posX,
            this.obstacles.rock.posY,
            this.obstacles.rock.width,
            this.obstacles.rock.height
          )

          this.gameCanvasContext.drawImage(
            this.obstacles.star.image,
            this.obstacles.star.posX,
            this.obstacles.star.posY,
            this.obstacles.star.width,
            this.obstacles.star.height
          )
      },

      renderHearts() {
        const dinoHealth = this.dinoCharacterData.health
        const heartPaddingX = 50

        for (let i = 0; i < dinoHealth; i++) {
          this.gameCanvasContext.drawImage(
          this.heart.image,
          this.heart.posX + (heartPaddingX * i),
          this.heart.posY,
          this.heart.width,
          this.heart.height
          )
        }
      },

      renderPoints(points) {
        const textString = `Points: ${points}`
        const ctx = this.gameCanvasContext
        ctx.font = "bold 32px Roboto"
        ctx.fillText(textString, 25, 115);
      },

      resetObstacleHits() {
        this.obstacles.rock.hitDino = false
        this.obstacles.birdy.hitDino = false
      },

      setBirdyRandomHeight() {
        this.obstacles.birdy.posY = Math.round((this.gameCanvas.height - 305) * Math.random())
        // Impede que o passáro apareça alto demais ou baixo demais
        if(this.obstacles.birdy.posY > 450)
        {
          this.obstacles.birdy.posY = 450
        }
        else if(this.obstacles.birdy.posY < 500)
        {
          this.obstacles.birdy.posY = 500
        }
      },

      updateBgPosition({moveX = 0, moveY = 0}) {
        if(moveX != 0) {
          this.bgStates.prevPosX = this.bgStates.posX
          this.bgStates.posX += moveX
        }
        if(moveY != 0) {
          this.bgStates.prevPosY = this.bgStates.posY
          this.bgStates.posY += moveY
        }
      },

      checkCollision(obstacle) {
        if(obstacle.hitDino == true) return

        const dinoPos = {
          x: this.dinoCharacterData.posX,
          y: this.dinoCharacterData.posY,
          w: this.dinoCharacterData.dimensions.dinoWidth,
          h: this.dinoCharacterData.dimensions.dinoHeight
        }
        const obstaclePos = {
          x: obstacle.posX,
          y: obstacle.posY,
          w: obstacle.width,
          h: obstacle.height
        }

        if (dinoPos.x < obstaclePos.x + obstaclePos.w &&
        dinoPos.x + dinoPos.w > obstaclePos.x &&
        dinoPos.y < obstaclePos.y + obstaclePos.h &&
        dinoPos.h + dinoPos.y > obstaclePos.y) {
          obstacle.hitDino = true
          if(obstacle.star) {
            this.healDino()
            this.resetObstacle(obstacle)
          }
          else this.damageDino() // Causa dano ao dinossauro se houver colisão com obstáculo
        }
      },

      updateSpeed() {
        const points = this.points
        let increase = 2 * parseInt(points / 5)
        this.bgStates.velX = this.bgStates.startingVelX + increase
      },

      healDino(healAmount = 1) {
        this.dinoCharacterData.health += healAmount
        if(this.dinoCharacterData.health > this.dinoCharacterData.maxHealth)
          this.dinoCharacterData.health = this.dinoCharacterData.maxHealth
      },

      damageDino(damageAmount = 1) {
        if(this.dinoCharacterData.health >= 1)
          this.dinoCharacterData.health -= damageAmount
        if(this.dinoCharacterData.health <= 0) {
          this.dinoCharacterData.health = 0
          this.dinoCharacterData.isDead = true
        }
      },

      playerJump() {
        const maxJumpAcceleration = -15
        const maxFrameAtMaxSpeed = 2
        this.dinoCharacterData.jump.jumpFrame++
        if(this.dinoCharacterData.jump.jumpFrame <= maxFrameAtMaxSpeed)
          this.dinoCharacterData.accelerationY = maxJumpAcceleration
        else {
            this.dinoCharacterData.accelerationY += 1
          if(this.dinoCharacterData.accelerationY > maxJumpAcceleration*-1)
            this.dinoCharacterData.accelerationY = maxJumpAcceleration*-1
        }
        this.dinoCharacterData.posY += this.dinoCharacterData.accelerationY
        if(this.dinoCharacterData.posY > this.floorLevel) {
          this.dinoCharacterData.jump.jumpFrame = 0
          this.dinoCharacterData.posY = this.floorLevel
          this.dinoCharacterData.jump.isJumping = false
          this.dinoCharacterData.accelerationY = 0
        }

      },

      setupImages() {
        this.dinoCharacter = new Image()
        this.dinoCharacter.src = this.dinoCharacterData.sprite
        this.dinoCharacter.width = this.dinoCharacterData.x
        this.dinoCharacter.height = this.dinoCharacterData.y

        this.gameBackground = new Image()
        this.gameBackground.src = gameBg

        this.obstacles.birdy.image = new Image()
        this.obstacles.birdy.image.src = bird
        this.obstacles.birdy.image.width = this.obstacles.birdy.width
        this.obstacles.birdy.image.height = this.obstacles.birdy.height

        this.obstacles.rock.image = new Image()
        this.obstacles.rock.image.src = rock
        this.obstacles.rock.image.width = this.obstacles.rock.width
        this.obstacles.rock.image.height = this.obstacles.rock.height

        this.heart.image = new Image()
        this.heart.image.src = heart
        this.heart.image.width = this.heart.width
        this.heart.image.height = this.heart.height

        this.obstacles.star.image = new Image()
        this.obstacles.star.image.src = star
        this.obstacles.star.image.width = this.obstacles.star.width
        this.obstacles.star.image.height = this.obstacles.star.height
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
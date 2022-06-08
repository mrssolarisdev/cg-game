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
    border: {// Borda do canvas
      required: false,
      default: '1px solid red',
      type: String
    },
    backgroundColor: {// Cor de fundo do canvas
      required: false,
      default: 'black',
      type: String
    }
  },
  mixins: [dinoData, obstaclesData],
  data: () => ({
      loopCount: 0, // Quantas iterações pelo gameloop nós já fizemos
      points: 0, // Quantos pontos o jogador fez a cada passada completa pelo cenário
      floorLevel: 595, // Posição Y da parte do background que representa o chão
      lastRender: null, // Tempo da última renderização
      gameCanvas: null, // Variavel que guarda o objeto canvas
      gameCanvasContext: null, // Variavel que guarda o contexto do canvas
      gameBackground: null, // Variável que guarda a imagem que vamos usar como background do cenario
      pressedKeys: new Set(), // Set de pressed keys. É um set para não permitir repetição
      pressedKeyEvent: null,
      bgStates: {
        prevPosX: 0, // Posição X passada do background na tela
        prevPosY: 0, // Posição Y passada do background na tela
        posX: 0, // Posição X atual do background na tela
        posY: 0, // Posição X atual do background na tela
        velX: 15, // Velocidade em X com a qual o background se move
        velY: 5, // Velocidade em Y com a qual o background se move  
        startingVelX: 15, // Velocidade inicial com a qual o background se move em X
        startingVelY: 5,// Velocidade inicial com a qual o background se move em Y
        size: 50
      },
      movements: {// Objeto de movimentos. Quando uma tecla é pressionada, se for uma tecla das abaixo, alteraremos o valor correspondente a ela
        up: false,
        down: false,
        left: false,
        right: false,
        none: false,
        special: false
      },
      // Objeto que guarda os dados das vidas do dinossauro (os corações no topo da tela).
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
      // Computed para retornar as dimensões do canvas
      getCanvasDimensions() {
          return {width: 1750, height: 900 }
      },
  },
  created (){
      // Solicita que o navegador execute essa função assim que possível, mas antes da próxima renderização de tela.
      window.requestAnimationFrame(this.loop)
  },
  // Coisas que são feitas na montagem do componente são aquelas que dependem que os elementos estejam renderizados
  // para ter efeito.
  mounted() {
    // Setando os elementos que precisam de imagens em suas configurações para renderizar
    this.setupImages()
    // Resgata o canvas
    this.gameCanvas = document.getElementById('myCanvas')
    // Resgata o contexto do canvas
    this.gameCanvasContext = this.gameCanvas.getContext('2d')
    // No descer de uma tecla, colocaremos ela no set de pressed keys.
    document.addEventListener('keydown', e => { this.pressedKeys.add(e.code);})
    /* No subir de uma tecla, retiraremos ela do set de pressed keys. Fazemos isso para que só se contabilize 
      um estímulo durante o tempo em que uma tecla desceu e continuou pressionada
    */
    document.addEventListener('keyup', e => { this.pressedKeys.delete(e.code);})
    // Geramos uma posição aleatória para o pássaro.
    this.obstacles.birdy.posY = Math.round((this.gameCanvas.height - 305) * Math.random())
    // Resetamos todos os obstáculos, os retornando para uma posição específica do canvas que o jogador ainda não pode ver.
    this.resetObstacle(this.obstacles.star)
    this.resetObstacle(this.obstacles.rock)
    this.resetObstacle(this.obstacles.birdy)
    // Ajusta posicionamento de obstáculos para que eles não se sobreponham
    this.preventOverlappingObstacles()
    // Ajusta a posição Y inicial dos obstaculos
    this.obstacles.rock.posY = 630
    this.obstacles.star.posY = 615
    // Posição X inicial do dinossauro
    this.dinoCharacterData.posX = 50
    // Posição Y inicial do dinossauro é a posição onde o chão se encontra
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

      /* Função controladora de eventos. Se uma das nossas teclas de interesse é pressionada, colocamos ela no set (para que não se repita)
      de teclas pressionadas*/
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
          // Se não tem teclas pressionadas, setamos a key de nenhum movimento para true.
          else if (this.pressedKeys.size <= 0) {
              this.movements.none = true
          }
      },
      
      /* Método update. Ele, por sua vez, poderia rodar dois tipos de update baseado em uma condição.
      Se o dinossauro estiver morto, ele vai rodaria um update específico. Senão, outro. Como o jogo não prosseguiu, 
      o update só acontece se o dinossauro não estiver morto.
      */
      update(){
          if (!this.dinoCharacterData.isDead) this.regularUpdate()
      },

      // Rotina de update para quando o jogador (dino) estiver vivo
      regularUpdate() {
        /* Essas checagens foram feitas aqui para evitar realizar a alteração do estado do dinossauro no handleEvents, já que a única responsabilidade que esse
          método deve ter é atualizar as estruturas responsáveis por ditar que teclas estão sendo pressionadas no momento, nada mais.
          Foram usadas estruturas if ao invés de else if para que se fosse possível realizar mais de uma movimentação simultâneamente.*/
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
          /* Se o movimento não for pra cima nem para a direita, o dinossauro não se move (já que só permitimos esses movimentos).
          Nesse caso, a animação dele vai ser a de iddle.
          */
          if (!this.movements.up && !this.movements.right) {
              this.shoudDinoMoveItself = true
              this.crtDinoState = "idle"  
          }
          // Se o background já saiu inteiro do canvas, uma mudança no cenário ocorreu. O jogador ganha um ponto por ter continuado vivo.
          if(this.bgStates.posX + this.gameCanvas.width < 0)
            this.points++

          // Se o dinossauro está no estado de pulo, ativamos a rotina de pulo.
          if(this.dinoCharacterData.jump.isJumping == true) this.playerJump()
          
          // Checando se houve colisão do dinossauro com os obstáculos.
          this.checkCollision(this.obstacles.birdy)
          this.checkCollision(this.obstacles.rock)
          this.checkCollision(this.obstacles.star)

          // Checa se os obstaculos estão fora da tela e os coloca na próxima posição fora do canvas para que sejam vistos ao mover do cenário pelo jogador.
          this.checkObstaclePosition(this.obstacles.birdy)
          this.checkObstaclePosition(this.obstacles.rock)
          this.checkObstaclePosition(this.obstacles.star)

          // Executa ajustes no posicionamento para previnir os objetos de se sobreporem.
          this.preventOverlappingObstacles()

          // Atualiza a velocidade do jogo com base na quantidade de pontos.
          this.updateSpeed()

          // Limpa o set de movimentos e deixa ele pronto para a próxima iteração.
          this.clearMovementsSet()
      },

      // Método render normal. Executa o regularRender. Os métodos foram divididos para que se pudesse ter um segundo método render que rodaria quando o jogador morre.
      render() {
        this.regularRender()
        if(this.dinoCharacterData.isDead) this.renderWhenDead()
      },

      // Método de renderização baseado nos dados atualizados do jogo. Só roda enquanto o dinossauro não estiver morto.
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

      // Renderiza uma mensagem na tela se o dinossauro morreu.
      renderWhenDead() {
        const ctx = this.gameCanvasContext
        const textString = "You Lose!"
        const textWidth = ctx.measureText(textString).width
        ctx.font = "bolder 64px Roboto"
        ctx.fillText(textString, this.gameCanvas.width / 2 - textWidth / 2, this.gameCanvas.height / 2);
      },

      // Método para renderizar os corações que representam as vidas do dinossauro na tela.
      renderHearts() {
        const dinoHealth = this.dinoCharacterData.health
        // Padding entre a esquerda e o primeiro coração.
        const heartPaddingX = 50

        // Para cada coração (qtd de vidas) renderiza uma imagem. 
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

      // Método renderizar os pontos que o jogador fez, na tela.
      renderPoints(points) {
        const textString = `Points: ${points}`
        const ctx = this.gameCanvasContext
        ctx.font = "bold 32px Roboto"
        ctx.fillText(textString, 25, 115);
      },

      // Método responsável por renderizar o background a cada momento (já que ele é o cenario que se move)
      updateBgPosition({moveX = 0, moveY = 0}) {
        /* Se a posição X atual do cenário não é 0, atribui a posição atual à variável de posição X anterior. E incrementa a posição atual.
        Mesma coisa para Y. Usaremos em breve. */
        if(moveX != 0) {
          this.bgStates.prevPosX = this.bgStates.posX
          this.bgStates.posX += moveX
        }
        if(moveY != 0) {
          this.bgStates.prevPosY = this.bgStates.posY
          this.bgStates.posY += moveY
        }
      },

      // Altera a velocidade com base no ponto do jogo em que o jogador chegou. A cada cenário, mais pontos. Quanto mais pontos, maior a velocidade.
      updateSpeed() {
        const points = this.points
        let increase = 2 * parseInt(points / 5)
        this.bgStates.velX = this.bgStates.startingVelX + increase
      },

      // Mecânica de pulo do dinossauro. A mecânica é feita simulando a gravidade. O pulo começa com intensidade forte e depois vai reduzindo, quanto mais se sobe.
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

      // Inicialização dos componentes que serão renderizados no canvas (que são imagens)
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

      // Limpa o set de movimentos.
      clearMovementsSet() {
          this.movements = {up: false, down: false, left: false, right: false, special: false}
      },

      // Retorna o resultado booleano do pressionamento de uma tecla.
      isItPressed(key) {
          return this.pressedKeys.has(key)
      }
  }
}
</script>
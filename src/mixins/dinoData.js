import dino from "@/assets/img/dino_sprite.png";
export const dinoData = {
    data() {
        return {
            dinoCharacter: null,
            dinoCharacterData: {
                dinoCharacter: null, // Dinossauro atual.
                sprite: dino, // Sprite a ser cortada. Pegaremos os dinossauros daqui.
                frameCounter: 0, // Frames passados entre cada troca de dinossauro (parte do sprite) a ser exibido. Usamos essa variável para controlar de quanto em quanto tempo trocamos a imagem do dinossauro.
                posX: 0, // Posição X do dinossauro.
                posY: 0, // Posição Y do dinossauro.
                health: 3, // Vida atual do dinossauro. Começa com o máximo.
                maxHealth: 3, // Vida máxima do dinossauro.
                isDead: false, // Estado que dita se o dinossauro está morto ou vivo.
                accelerationY: 0, // A velocidade do dinossauro pulando. Usada para diminuir a força do pulo quando chegando no ponto máximo.
                jump: {
                    isJumping: false, // Estado que dita se o dinossauro está pulando
                    jumpFrame: 0 // Variável que guarda em qual frame do pulo o dinossauro está. Usado para controlar a força do pulo e simular gravidade.
                },
                dimensions: {
                    x: 1350, // Largura do sprite.
                    y: 134, // Altura do sprite.
                    columnCount: 10, // Quantidade de dinossauros do sprite.
                    topDinoPadding: 21, // Padding entre o topo da imagem e o começo da cabeça do dinossauro.
                    leftDinoPadding: 44, // 43.5 de padding entre cada dinossauro.
                    currentDino: null, // Dinossauro atual dentre os possíveis dinossauros.
                    lastMode: "idle",
                    currentDinoIndex: 3, // Index atual representando o dinossauro da iamgem.
                    dinoWidth: 85, // Largura do dinossauro, o quão gordinho ele é.
                    dinoHeight: 97, // Altura do dinossauro. 
                    endIdleStateIndex: 3, // Índice do último sprite da animação de idle.
                    endRunningStateIndex: 9, // Índice do último sprite da animação de corrida.
                    lastDinoPosition: null,
                }
            },
            shoudDinoMoveItself: false, // Variável que diz se o dinossauro deve animar. As animações podem ser de idle ou moving.
            crtDinoState: "", // Variável que guarda o estado do dinossauro: movendo ou em idle.
        }
    },
    computed: {
        // Fiz essa computed pra não precisar escrever tanto e deixar o código menos poluido. Mas retorna o mesmo dado.
        dinoDimensions() {
            return this.dinoCharacterData.dimensions
        }
    },
    methods: {
        // Checa se houve a colisão de um obstaculo especifico com o dinossauro.
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

        /* Se a posição do dinossauro em X for menor que o lado direito do obstaculo &
          Se o lado direito do dinossauro for maior que a posição X do obstaculo em questão &
          Se a posição do dinossauro em Y for menor que o lado de baixo do obstaculo &
          Se o lado de baixo do dinossauro for maior que a posição Y do obstaculo em questão:

          Então houve uma colisão de algo com o dinossauro. Agora checamos o que atingiu ele.
          Se foi uma estrela, o dinossauro é curado e a estrela é retirada do campo de visão da tela.
        */
        if (dinoPos.x < obstaclePos.x + obstaclePos.w &&
        dinoPos.x + dinoPos.w > obstaclePos.x &&
        dinoPos.y < obstaclePos.y + obstaclePos.h &&
        dinoPos.h + dinoPos.y > obstaclePos.y) {
          obstacle.hitDino = true
          if(obstacle.star) {
            this.healDino()
            this.resetObstacle(obstacle)
          }
          // Se não for a estrela, dá dano no dinossauro.
          else this.damageDino() 
        }
      },

      // Cura o dinossauro. Só faz isso se a vida já não estiver no limite máximo.
      healDino(healAmount = 1) {
        this.dinoCharacterData.health += healAmount
        if(this.dinoCharacterData.health > this.dinoCharacterData.maxHealth)
          this.dinoCharacterData.health = this.dinoCharacterData.maxHealth
      },

      // Dá dano no dinossauro. Só faz isso se a vida ainda é pelo menos 1. Se estiver abaixo disso, matamos o dinossauro.
      damageDino(damageAmount = 1) {
        if(this.dinoCharacterData.health >= 1)
          this.dinoCharacterData.health -= damageAmount
        if(this.dinoCharacterData.health <= 0) {
          this.dinoCharacterData.health = 0
          this.dinoCharacterData.isDead = true
        }
      },

      // Método responsável por renderizar o dinossauro.
      renderDino(mode = "idle") {
        // Se o modo de renderização do dinossauro atual não é o mesmo sendo passado agora, atualiza o modo.
        if(this.dinoCharacterData.lastMode != mode) {
            this.dinoCharacterData.lastMode = mode
            // Se o modo de animar o dinossauro for idle, volta o index para 0, que é o index de onde começa a sprite de idle.
            if(mode == "idle") {
                this.dinoDimensions.currentDinoIndex = 0
            }
            // Se o modo for move, volta o index para 4, que é de onde começa o sprite de corrida.
            else if(mode == "move") {
                this.dinoDimensions.currentDinoIndex = 4
            }
        }
        // Definição de variáveis
        let spriteInterval = 0
        let listaFrames = []    

        switch (mode) {
            // Se o modo for move, o intervalo de mudança na sprite atual é de 20, se for idle é de 10
            case "move":
                spriteInterval = 20
                break
            case "idle":
                spriteInterval = 10
        }

        /* Se o dinossauro pode se mover e a quantidade de frames passados desde o começo do movimento é maior que o intervalo de sprites
        definido, então partimos para o próximo sprite e frame, desligando o motor de movimento para que possa ser ativado de novo depois.
         */
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
        // Só tem um "for" pq o sprite so tem uma linha
        for (let j = 0; j < this.dinoDimensions.columnCount; j++) {
            let x1 = this.dinoDimensions.leftDinoPadding + (this.dinoDimensions.dinoWidth * j) + (this.dinoDimensions.leftDinoPadding * j)
            let y1 = this.dinoDimensions.topDinoPadding + (this.dinoDimensions.dinoHeight * 0)
            listaFrames[0 * this.dinoDimensions.columnCount + j] = {x1, y1}
        }
        // Seta o dinossauro atual para o dinossauro de coordenadas definidas acima.
        this.dinoDimensions.currentDino = listaFrames[this.dinoDimensions.currentDinoIndex]
        // Resgata o contexto do canvas onde acontece a renderização.
        let ctx = this.gameCanvas.getContext('2d')
        /* 
            Desenha o dinossauro no canvas.
            Parâmetros:
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
    },
}
export const obstaclesData = {
    data() {
        return {
            obstacles: {
                birdy: {
                  image: null,
                  posX: 0,
                  posY: 0,
                  width: 75,
                  height: 75,
                  hitDino: false,
                  birdy: true
                },
                rock: {
                    image: null,
                    posX: 0,
                    posY: 0,
                    width: 100,
                    height: 75,
                    hitDino: false,
                    rock: true
                },
                star: {
                    image: null,
                    posX: 0,
                    posY: 0,
                    width: 60,
                    height: 55,
                    hitDino: false,
                    star: true
                },
            }
        }
    },

    methods: {
        moveObstacle(obstacle) {
            const xToMove = this.bgStates.prevPosX - this.bgStates.posX
            obstacle.posX -= xToMove
        },

        // Se o obstáculo está fora do canvas (lado esquerdo), coloca ele de volta numa posição não visivel pelo jogador.
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

        // Impede obstaculos de se sobreporem.
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

        resetObstacleHits() {
            this.obstacles.rock.hitDino = false
            this.obstacles.birdy.hitDino = false
        },

        setBirdyRandomHeight() {
            this.obstacles.birdy.posY = Math.round((this.gameCanvas.height - 305) * Math.random())
              console.log(this.obstacles.birdy.posY)
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
    }
}
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
    created() {

    }
}
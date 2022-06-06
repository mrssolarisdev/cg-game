import dino from "@/assets/img/dino_sprite.png";
export const dinoMethods = {
    data() {
        return {
            dinoCharacter: null,
            dinoCharacterData: {
                dinoCharacter: null,
                sprite: dino,
                frameCounter: 0,
                posX: 0,
                posY: 0,
                health: 3,
                maxHealth: 3,
                isDead: false,
                isJumping: false,
                accelerationY: 0,
                jump: {
                    isJumping: false,
                    jumpFrame: 0
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
            }
        }
    },

    created() {

    }
}
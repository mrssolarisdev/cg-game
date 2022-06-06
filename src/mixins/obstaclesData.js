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
}
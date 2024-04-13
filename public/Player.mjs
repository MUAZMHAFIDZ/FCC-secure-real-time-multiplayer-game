class Player {
  constructor({x, y, score = 0, id}) {
    this.x = x
    this.y = y
    this.score = score
    this.id = id
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case "left":
        this.x -= speed
        break
      case "right":
        this.x += speed
        break
      case "up":
        this.y += speed
        break
      case "down":
        this.y -= speed
        break
      default:
        break
    }
  }

  collision(item) {
    if (item.x === this.x && item.y === this.y) {
      return true
    }
  }

  calculateRank(arr) {
    const totalPlayers = arr.length
    const sortedRanks = arr.sort((a, b) => b.score - a.score)
    let rank;
    for (let n = 0; n < totalPlayers; n++) {
      if (this.score === sortedRanks[n].score) {
        rank = n + 1
      }
    }
    if (!rank || !totalPlayers) {
      return "..."
    }
    return `Rank: ${rank}/${totalPlayers}`
  }
}

export default Player;

import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
let clientPlayer, collectible;

const randomXStart = Math.floor(Math.random() * 420 + 20)
const randomYStart = Math.floor(Math.random() * 440 + 20)


socket.on('connect', () => {
  document.getElementById('connection-info').textContent = `You are connected with socket id ${socket.id}`
  clientPlayer = new Player({ x: randomXStart, y: randomYStart, score: 0, id: socket.id })
  socket.emit('updatePlayer', {playerObj: clientPlayer})
})

socket.on('init', handleInit)

socket.on('updatedGameState', gameState => {
  init(gameState)
})

function handleInit(serverMessage) {
  console.log(serverMessage)
}

function init(gameState) {
  document.addEventListener("keydown", keydown)
  context.fillStyle = "#231f20"
  context.fillRect(0, 0, 460, 480)
  paintGameState(gameState)
  document.getElementById("game-stats").textContent = `Your Score: ${clientPlayer.score} |  ${clientPlayer.calculateRank(gameState.players.map(player => player.playerObj))}`
  if (checkCollision()) {
    clientPlayer.score += 1
    socket.emit('refresh-collectible', true)
  }
}

function paintGameState(gameState) {
  const player = canvas.getContext('2d')
  for (let p of gameState.players) {
    player.fillStyle = p.playerObj.id === clientPlayer.id ? "green" : "red"
    context.fillRect(p.playerObj.x, p.playerObj.y, 20, 20) 
  }
  collectible = new Collectible(gameState.collectible)
  const collectCanvas = canvas.getContext('2d')
  collectCanvas.fillStyle = "blue"
  context.fillRect(collectible.x, collectible.y, 10, 10)
}

function keydown(e) {
  if (e.keyCode === 37) {
    if (clientPlayer.x < 20) {return}
    clientPlayer.movePlayer("left", 20)
    socket.emit('updatePlayer', {playerObj: clientPlayer})
  }
  if (e.keyCode === 38) {
    if (clientPlayer.y < 20) {return}
    clientPlayer.movePlayer("down", 20)
    socket.emit('updatePlayer', {playerObj: clientPlayer})
  }
  if (e.keyCode === 39) {
    if (clientPlayer.x > 420) {return}
    clientPlayer.movePlayer("right", 20)
    socket.emit('updatePlayer', {playerObj: clientPlayer})
  }
  if (e.keyCode === 40) {
    if (clientPlayer.y > 440) {return}
    clientPlayer.movePlayer("up", 20)
    socket.emit('updatePlayer', {playerObj: clientPlayer})
  }
}

function checkCollision() {
  if (Math.abs(clientPlayer.x - collectible.x) < 12 && Math.abs(clientPlayer.y - collectible.y) < 12) {
    return true
  } else {
    return false
  }
}
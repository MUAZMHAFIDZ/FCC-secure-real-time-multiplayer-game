require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet.xssFilter())
app.use(helmet.noSniff())
app.use(helmet.noCache())
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "PHP 7.4.3");
  next();
});

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});


//socketio setup

const io = socket(server)

let gameState = {
  players: [],
  collectible: getNewCollectable()
}

function getNewCollectable() {
  const randX = Math.floor(Math.random() * 420 + 20)
  const randY = Math.floor(Math.random() * 440 + 20)
  const randId = Math.floor(Math.random() * 999999999)
  return {x: randX, y: randY, value: 1, id: randId}
}

io.on('connection', client => {
  client.emit('init', "YOU ARE CONNECTED!")
  
  client.on('updatePlayer', playerObj => {
    
    let updatedPlayersState = gameState.players.map(player => player.playerObj.id === playerObj.playerObj.id ? playerObj : player)
    
    const clientPlayer = gameState.players.filter(player => player.playerObj.id === playerObj.playerObj.id)
    if (clientPlayer.length === 0) {
      updatedPlayersState = [...updatedPlayersState, playerObj]
    }

    gameState.players = updatedPlayersState
    io.emit('updatedGameState', gameState)
  })

  client.on('refresh-collectible', (boolean) => {
    if (boolean) {
      gameState.collectible = getNewCollectable()
      io.emit('updatedGameState', gameState)
    }
  })

  client.on('disconnect', (reason) => {
    const updatedPlayersState = gameState.players.filter(player => player.playerObj.id !== client.id)
    gameState.players = updatedPlayersState
    io.emit('updatedGameState', gameState)
  })
})

module.exports = app; // For testing

var NNode = neataptic.Node;
var Neat = neataptic.Neat;
var Network = neataptic.Network;
var methods = neataptic.methods;
var architect = neataptic.architect;
var BOARD_SIZE=4;
var MUTATION_RATE=0.1;
var ELITISM_PERCENT=0.1;
var USE_TRAINED_POP=false;
var PLAYER_AMOUNT=50
var START_HIDDEN_SIZE=16;
var pop = [];
/*for (var i = 0; i < batchSize; i++) {
  pop.push(randNet());
}*/

function randNet() {
  //return neataptic.
  var network = architect.Random(16, 10, 4);
  return network;
}
function currentBoard() {
  return game.grid.cells.reduce((a, b) => a.concat(b)).map(x => (
    x
    ? 0.5 / x.value
    : 1));
}
function stringBoard() {
  return game.grid.cells.map(a=>a.map(x => (
    x
    ? x.value
    : 0)).join(",")).join(";");
}

var runningNet = false;
var runningLoop = -1;
var stuck = false;
var tNetCB=Math.sqrt;
//drawGraph(network.graph(1000, 800), '.svg');
function testNetVisible(network,callback) {
  tNetCB=callback;
  window.clearInterval(runningLoop);
  game.restart();
  runningNet = network;
  stuck = false;
  runningLoop = window.setInterval(tickVisible, 0);
  /*while(!game.over){
    var choices=network.activate(currentBoard());
    var max=Math.max(...choices);
    game.move([0,1,2,3].filter(x=>choices[x]===max)[0]);
  }*/
}
function tryMove(way){
  var before=stringBoard();
  game.move(way);
  return before!==stringBoard();
}
function tickVisible() {
  if (game.over || stuck) {
    runningNet = false;
    window.clearInterval(runningLoop);
    if(tNetCB){
      tNetCB();
    }
  }
  if (runningNet) {
    var choices = runningNet.activate(currentBoard());
    var max = Math.max(...choices);
    var markedChoices = [0, 1, 2, 3].map(x => ({v: x, s: choices[x]}));
    markedChoices.sort(function(a, b) {
      return b.s - a.s;
    });
    var moved = tryMove(markedChoices[0].v);
    if (!moved) {
      var moved = tryMove(markedChoices[1].v);
      if (!moved) {
        var moved = tryMove(markedChoices[2].v);
        if (!moved) {
          var moved = tryMove(markedChoices[3].v);
          if (!moved) {
            stuck = true;
          }
        }
      }
    }
  }
}
var runningNet = false;
var runningLoop = -1;
var stuck = false;
//drawGraph(network.graph(1000, 800), '.svg');
function testNet(network) {
  //  window.clearInterval(runningLoop);
  game.restart();
  runningNet = network;
  stuck = false;
  //  runningLoop=window.setInterval(tick,100);
  while (!(game.over || stuck)) {
    var choices = runningNet.activate(currentBoard());
    var max = Math.max(...choices);
    var markedChoices = [0, 1, 2, 3].map(x => ({v: x, s: choices[x]}));
    markedChoices.sort(function(a, b) {
      return b.s - a.s;
    });
    var moved = tryMove(markedChoices[0].v);
    if (!moved) {

      var moved = tryMove(markedChoices[1].v);
      if (!moved) {
        var moved = tryMove(markedChoices[2].v);
        if (!moved) {
          var moved = tryMove(markedChoices[3].v);
          if (!moved) {
            stuck = true;
          }
        }
      }
    }
  }
  return game.score;
}
function advancedTest(network, times) {
  var ave = 0;
  for (var i = 0; i < times; i++) {
    ave += testNet(network) / times;
  }
  return ave;
}
function tick() {
  if (game.over || stuck) {
    runningNet = false;
    window.clearInterval(runningLoop);
  }
  if (runningNet) {
    var choices = runningNet.activate(currentBoard());
    var max = Math.max(...choices);
    var markedChoices = [0, 1, 2, 3].map(x => ({v: x, s: choices[x]}));
    markedChoices.sort(function(a, b) {
      return b.s - a.s;
    });
    var moved = tryMove(markedChoices[0].v);
    if (!moved) {
      var moved = tryMove(markedChoices[1].v);
      if (!moved) {
        var moved = tryMove(markedChoices[2].v);
        if (!moved) {
          var moved = tryMove(markedChoices[3].v);
          if (!moved) {
            stuck = true;
          }
        }
      }
    }
  }
}
function findBests(population) {
  var markedPop = population.map(x => ({
    n: x,
    s: advancedTest(x, 10)
  }));
  markedPop.sort(function(a, b) {
    return b.s - a.s;
  });
  return markedPop;
}
function newGen(population) {
  var reserved = 10;
  var nextPop = findBests(population).slice(0, reserved).map(x => x.n);
  for (var i = 0; i < batchSize - reserved; i++) {
    var a = nextPop[Math.floor(Math.random() * reserved)];
    var b = nextPop[Math.floor(Math.random() * reserved)];
    nextPop.push(Network.crossOver(a, b));
    if (Math.random() < 0.5) {
      nextPop[nextPop.length - 1].mutate(neataptic.methods.mutation.ALL);
    }
  }
  return nextPop;
}
function increment() {
  pop = newGen(pop);
}
function showBest(population) {
  var best = findBests(population)[0].n;
  game.actuator.clearMessage();
  testNetVisible(best);
}
function evolve(times) {
  //game.actuator.uiOn = false;
  for (var i = 0; i < times; i++) {
    increment();
  }
  //game.actuator.uiOn = true;
  showBest(pop);
  console.log(game.score);
}
/** Construct the genetic algorithm */
function initNeat(){
  window.neat = new Neat(
    BOARD_SIZE*BOARD_SIZE,
    4,
    function(network){return advancedTest(network, 10);},
    {
      mutation: methods.mutation.ALL,
      popsize: PLAYER_AMOUNT,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * PLAYER_AMOUNT),
      network: new architect.Random(
        BOARD_SIZE*BOARD_SIZE,
        START_HIDDEN_SIZE,
        4
      )
    }
  );

  //if(USE_TRAINED_POP) neat.population = population;
}
initNeat();



/** End the evaluation of the current generation */
/*function endEvaluation(){
  console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

  neat.sort();
  var newPopulation = [];

  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i]);
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }

  // Replace the old population with the new population
  neat.population = newPopulation;
  neat.mutate();

  neat.generation++;
}*/
/* window.onready=function(){
evolve(100);
} */
/*function runFromString(str,cb) {
  testNetVisible(Network.fromJSON(JSON.parse(str)),cb);
}
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  }
  rawFile.send(null);
}

//usage:
function fromMade() {
  console.log(game.score);
  readTextFile("../op.json", function(text) {
    //var data = JSON.parse(text);
    runFromString(text,fromMade);
  });
}
window.setTimeout(fromMade, 1000);
*/

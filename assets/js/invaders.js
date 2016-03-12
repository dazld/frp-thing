const log = console.log.bind(console);

import Bacon from 'baconjs';
import Victor from 'victor';
import _ from 'lodash';

log('started');

const $ = document.querySelector.bind(document);
const body = $('body');
const game = $('.game');
const ctx = game.getContext('2d');
const WIDTH = 512;
const HEIGHT = 512;

// const div = document.createElement.bind(document, 'div');
// const invader = c => {let a = div()}; a.className = 'invader';a.textContent = c; return a};
// const tick = Bacon.repeatedly(1000, [0,1]);
// tick.log();

function makeButton(text) {
    const btn = document.createElement('input');
    btn.setAttribute('type','button');
    btn.value = text;
    const stream = Bacon.fromEvent(btn, 'click');
    return {btn,stream};
}

let {btn,stream} = makeButton('tick');
let tick = stream;
body.appendChild(btn);
tick.map('tick')

// globals
window.Bacon = Bacon;
window.ctx = ctx;
window.V = Victor;

function clearBoard() {
    ctx.clearRect(0,0,WIDTH, HEIGHT);
}

function drawInvader(pos) {
    // if (!pos) return;
    let {x,y} = pos;
    ctx.beginPath();
    ctx.rect(x,y,13,7);
    ctx.rect(x+3,y-3,7,7)
    ctx.fill();
    return pos;
}
window.clearBoard = clearBoard;
window.draw = drawInvader;


function incX(invader) {
    let {pos, direction} = invader;
    pos.x += direction * 3;
    // pos.addScalarX(direction * 3);
    if (pos.x >= width) {
        incY(invader);
        direction = direction * -1;
    }
    // pos.x = pos.x > width ? 0 : pos.x;
    return {
        ...invader,
        pos,
        direction
    };
}

function incY(pos) {
    pos.y += 3;
    // pos.y = pos.y > height ? 0 : pos.y;
    return pos;
}

const invaderStream = Bacon.repeat(function() {
    // infinite stream of blank invaders
    // this will be scanned by the board function to assemble the wave
    return Bacon.once({
        idx: 0,
        pos: new Victor({x:0, y: 0}),
        direction: 1
    });
});

// wave is a proprerty
// wave updates based in filtering from another property which is the dead invaders
// tick samples the wave to know which invaders to render
// when wave is empty, make a new one

function bullet(){}

function wave(){
    let waveSize = 26;
    let x = 1;
    let y = 1;
    let GRID_SIZE = 60;


    // the stream ends once we take some :(
    return invaderStream
            .take(waveSize)
            .reduce([], function(acc,i){

                let X = x * GRID_SIZE;
                x = x + 1;

                if (X > WIDTH ) {
                    y++;
                    x = 1;
                    X = x * GRID_SIZE;
                }

                let Y = y * GRID_SIZE;

                let {pos} = i;
                pos.x = X;
                pos.y = Y;
                acc.push(i);
                return acc;
            })
            .filter(function(i){
                // remove dead invaders here
                return true; // return everything for now
                // oh nuts, this actually is just ever one value. how to map the dead ones with live?
            })
            .toProperty()
}


wave().sampledBy(tick).onValue(function(w){
    clearBoard();
    w.forEach(function({pos}){
        drawInvader(pos);
    });
})

const log = console.log.bind(console);

import Bacon from 'baconjs';
import Victor from 'victor';

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
let tick = Bacon.interval(32);
// tick = stream;
body.appendChild(btn);
tick.map('tick')

// globals
window.Bacon = Bacon;
window.ctx = ctx;
window.V = Victor;


function bindInputs() {
    const keys = Bacon.fromEvent(window, 'keydown').map('.keyCode')
    const lefts = keys.filter((x)=> x === 37);
    const rights = keys.filter((x)=> x === 39);

    return {
        left: lefts,
        right: rights
    }
}

function clearBoard() {
    ctx.clearRect(0,0,WIDTH, HEIGHT);
}

function drawInvader(pos) {
    // if (!pos) return;
    let {x,y} = pos;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.rect(x,y,13,7);
    ctx.rect(x+3,y-3,7,7)
    ctx.fill();
    // ctx.stroke()
    return pos;
}
window.clearBoard = clearBoard;
window.draw = drawInvader;


function getInvaders() {
    return Bacon.repeat(function() {
        // infinite stream of blank invaders
        // this will be scanned by the board function to assemble the wave
        return Bacon.once({
            idx: 0,
            pos: new Victor({x:0, y: 0}),
            direction: 1
        });
    });

}

// wave is a proprerty
// wave updates based in filtering from another property which is the dead invaders
// tick samples the wave to know which invaders to render
// when wave is empty, make a new one

function bullet() {

}

function invert(n) {
    return n * -1;
}


function direction() {
    return Bacon.constant(-1)
        .take(1)
        // .flatMap(direction)
        .map(n => n*-1)
        .toProperty();
}


function wave() {
    let waveSize = 32;
    let x = 1;
    let y = 1;
    let GRID_SIZE = 60;

    // the stream ends once we take some :(
    return getInvaders()
            .take(waveSize)
            .reduce([], function(acc,i) {


                if (x * GRID_SIZE >= (WIDTH - 30) ) {
                    y++;
                    x = 1;
                }

                let Y = y * GRID_SIZE;
                let X = x * GRID_SIZE;

                x = x + 1;

                let {pos} = i;
                pos.x = X;
                pos.y = Y;
                acc.push(i);
                return acc;
            })
            .filter(function(i) {
                // remove dead invaders here
                return true; // return everything for now
                // oh nuts, this actually is just ever one value. how to map the dead ones with live?
            })
            .toProperty()
}


wave().sampledBy(tick).map(function(w) {
    return w.map( i => {
        i.pos.x += 3 * i.direction;
        if (i.pos.x >= WIDTH - 30 || i.pos.x <= 30) {
            i.direction = i.direction * - 1;
        }
        return i;
    });
}).onValue(function(w) {
    clearBoard();
    w.forEach(function({pos}) {
        drawInvader(pos);
    });
})

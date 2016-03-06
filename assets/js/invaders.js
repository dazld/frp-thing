const log = console.log.bind(console);

import Bacon from 'baconjs';
import Victor from 'victor';
import _ from 'lodash';

log('started');

const $ = document.querySelector.bind(document);
const body = $('body');
const game = $('.game');
const ctx = game.getContext('2d');
const width = 512;
const height = 512;

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
let tick = stream; // Bacon.interval(16);
body.appendChild(btn);
tick.map('tick')

// globals
window.Bacon = Bacon;
window.ctx = ctx;
window.V = Victor;

function clearBoard() {
    ctx.clearRect(0,0,width, height);
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
    pos.addScalarX(direction * 3);
    if (pos.x >= width) {
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
    pos.addScalarY(3)
    pos.y = pos.y > height ? 0 : pos.y;
    return pos;
}

const invaderStream = Bacon.repeat(function() {
    // infinite stream of blank invaders
    // this will be scanned by the board function to assemble the wave
    return Bacon.once({
        idx: 0,
        pos: new Victor(480,0),
        direction: 1
    });
});

function makeWave(size) {
    // get a list of invaders corresponding to the size of the wave
    // setup wave positions
    let xOffset = 1;
    let yOffset = 1;
    let wave = invaderStream.take(1).map(function(invader) {
        let {i,pos} = invader;

        if (xOffset * 28 >= width - 28) {
            yOffset++;
            xOffset = 1;
        }
        pos.addScalarX(xOffset * 28)
        pos.addScalarY(yOffset * 28);
        i = ++xOffset;
        return {
            ...invader,
            i,
            pos,
        };
    }).toProperty();
    return wave;
}

const wave = makeWave(12);
tick.onValue(clearBoard);
wave.sampledBy(tick).map(incX).map('.pos').onValue(drawInvader)

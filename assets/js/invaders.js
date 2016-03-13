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
const GRID_SIZE = 60;
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
tick = Bacon.interval(32);

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
bindInputs().left.log();

function clearBoard() {
    ctx.clearRect(0,0,WIDTH, HEIGHT);
}

function drawInvader(pos) {
    // if (!pos) return;
    let {x,y} = pos;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,32,32,0.8)';
    ctx.rect(x,y,13,7);
    ctx.rect(x+3,y-3,7,7)
    ctx.fill();
    // ctx.stroke()
    return pos;
}
window.clearBoard = clearBoard;
window.draw = drawInvader;


function getInvader(i) {

    let x = (i % 8) + 1;
    let y = Math.floor(i / 8) + 1;

    let pos = [x,y].map(n => n*GRID_SIZE);

    let v = new Victor(...pos);

    return {
        idx: 0,
        pos: v,
        direction: 1,
        dead: false
    };

}


function emptyArray(size) {
    return Array.apply(null, {length: size});
}

// function invert(n) {
//     return n * -1;
// }

//
// function direction() {
//     return Bacon.constant(-1)
//         .take(1)
//         // .flatMap(direction)
//         .map(n => n*-1)
//         .toProperty();
// }


function wave() {
    console.log('Making new wave!');

    let w = emptyArray(32).map( (_,i) => getInvader(i) );

    return Bacon.once(w)
                .sampledBy(tick)
                .filter(function(v) {
                    // are they all dead?
                    return v.reduce(function(acc,i) {
                        return i.dead && acc;
                    },true);
                })
                .take(1)
                .flatMapLatest(wave)
                .toProperty(w);
}

function updatePosition(i) {
    i.pos.x += 3 * i.direction;
    if (i.pos.x >= WIDTH - 30 || i.pos.x <= 30) {
        i.direction = i.direction * - 1;
    }
    // simulate pew pew
    i.dead = !i.dead ? Math.random() > 0.95 : i.dead;
    return i;
}

function updatePositions(w) {
    return w.map(updatePosition);
}

wave().sampledBy(tick).map(updatePositions)
    .onValue(function(w) {
        clearBoard();
        w.forEach(i => !i.dead && drawInvader(i.pos));
    });

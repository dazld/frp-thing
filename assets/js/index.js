import Bacon from 'baconjs';

window.Bacon = Bacon;

const log = console.log.bind(console);
const $ = document.querySelector.bind(document);

function getDimensions(e) {
    const nav = $('.nav');
    const topbar = $('.topbar');

    const navPos = nav.getBoundingClientRect();
    const tpPos = topbar.getBoundingClientRect();

    return {
        topbar: {
            height: tpPos.height,
            top: topbar.offsetTop
        },
        nav: {
            height: navPos.height,
            top: nav.offsetTop
        }
    };
}

function getTopScroll(e) {

    return window.pageYOffset;
}

function setStickyState(sticky) {
    sticky = !!sticky;
    const nav = $('.nav');
    const spacer = $('.nav-spacer');
    nav.classList.toggle('fixed', sticky);
    spacer.classList.toggle('visible', sticky);

    if (sticky) {
        const dims = getDimensions();
        nav.style.top = dims.topbar.height + 'px';
    } else {
        nav.removeAttribute('style');
    }
}

let dimensions = Bacon.fromEvent(window, 'resize').map(getDimensions).toProperty();
let topScroll = Bacon.fromEvent(window, 'scroll').map(getTopScroll).toProperty();

const calcBoth = dimensions.combine(topScroll, function(dims,pos) {
    // log(dims, pos)
    return pos > dims.nav.top - dims.topbar.height;
}).log();

const toggle = calcBoth.diff(false, function(a,b) {
    return a || b;
}).skipDuplicates().log();


toggle.onValue(function(value) {
    setStickyState(value);
});

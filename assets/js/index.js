import Bacon from 'baconjs';

var $ = document.querySelector.bind(document);

function getDimensions() {
    var nav = $('.nav');
    var topbar = $('.topbar');

    var navPos = nav.getBoundingClientRect();
    var tpPos = topbar.getBoundingClientRect();

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

function setStickyState(state) {
    state = !!state;
    var nav = $('.nav');
    var spacer = $('.nav-spacer');
    nav.classList.toggle('fixed', state);
    spacer.classList.toggle('visible', state);

    if (state) {
        var dims = getDimensions();
        nav.style.top = dims.topbar.height + 'px';
    } else {
        nav.removeAttribute('style');
    }
}

var dimensions = Bacon.fromEvent(window, 'resize').map(getDimensions);
dimensions = dimensions.toProperty(getDimensions());

var yPosition = Bacon.fromEvent(window, 'scroll').map(function() {
    return window.scrollY;
});
yPosition = yPosition.toProperty(window.scrollY);


var calcBoth = dimensions.combine(yPosition, function(dims,pos) {
    return pos > dims.nav.top - dims.topbar.height;
});

var toggle = calcBoth.diff(false, function(a,b) {
    return a || b;
}).skipDuplicates();


toggle.onValue(function(value) {
    setStickyState(value);
});

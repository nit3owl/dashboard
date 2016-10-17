"use strict";

class Position {
    constructor(multX, multY) {
        this.multX = multX;
        this.multY = multY;
    }
}

class RenderContext {
    constructor(canvas, x, y, size, fallbackElem, clearBeforeRender) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.size = size;
        this.fallbackElem = fallbackElem;
        this.clearBeforeRender = clearBeforeRender;
    }
}

const ONE = new Position(0, 0);
const THREE = new Position(2, 0);
const FOUR = new Position(0, 1);
const FIVE = new Position(1, 1);
const SIX = new Position(2, 1);
const SEVEN = new Position(0, 2);
const NINE = new Position(2, 2);

const POSITIONS = [
    [FIVE],
    [THREE, SEVEN],
    [THREE, FIVE, SEVEN],
    [ONE, THREE, SEVEN, NINE],
    [ONE, THREE, FIVE, SEVEN, NINE],
    [ONE, THREE, FOUR, SIX, SEVEN, NINE]
];

var reqRef = [];

function drawDie(renderContext) {
    let dots = randomInt(1, 7);
    if (renderContext.canvas.getContext) {
        let context = renderContext.canvas.getContext('2d');

        if (renderContext.clearBeforeRender)
            context.clearRect(0, 0, renderContext.canvas.width, renderContext.canvas.height);

        requestAnimationFrame(function () {
            shakeCube(renderContext);
        });

        setTimeout(function () {
            cancelAnimationFrame(reqRef.pop());
            context.clearRect(renderContext.x - 1, 0, renderContext.x + renderContext.size, renderContext.canvas.height);
            drawCube(context, renderContext.x, renderContext.y, renderContext.size);
            drawDots(context, renderContext.x, renderContext.y, renderContext.size, dots);
        }, 750);
    } else {
        renderContext.fallbackElem.innerHTML = 'Your browser does not support canvas.';
    }
}

function shakeCube(renderContext) {
    let context = renderContext.canvas.getContext('2d');
    let wobble = Math.sin(Date.now() / 30) * (window.innerHeight / 50);

    context.clearRect(renderContext.x - 1, 0, renderContext.x + renderContext.size, renderContext.canvas.height);
    drawCube(context, renderContext.x, renderContext.y + wobble, renderContext.size);

    reqRef.push(requestAnimationFrame(function () {
        shakeCube(renderContext);
    }));
}

function drawCube(context, x, y, size) {
    //draw face
    context.fillStyle = 'rgb(247, 216, 212)';
    context.fillRect(x, y, size, size);

    //draw top 
    context.beginPath();
    context.moveTo(x + 1, y);
    context.lineTo(x + (size * .375), y - (size * .25));
    context.lineTo(x + size * 1.375, y - (size * .25));
    context.lineTo(x + size, y);

    let gradient = context.createLinearGradient(x, y, x, y - (size * .25));
    gradient.addColorStop(0, 'rgb(243, 197, 190)');
    gradient.addColorStop(1, 'rgb(192,57,43)');
    context.fillStyle = gradient;
    context.fill();

    //draw side
    context.beginPath();
    context.moveTo(x + size, y + size);
    context.lineTo(x + size * 1.375, y + (size * .75));
    context.lineTo(x + size * 1.375, y - (size * .25));
    context.lineTo(x + size, y);
    context.lineTo(x + size, y + size);

    gradient = context.createLinearGradient(x + size, y, x + size * 1.375, y);
    gradient.addColorStop(0, 'rgb(243, 197, 190)');
    gradient.addColorStop(1, 'rgb(192,57,43)');
    context.fillStyle = gradient;
    context.fill();
}

function drawDots(context, x, y, size, dots) {
    let quadSize = size / 3;
    for (let i = 0; i < POSITIONS[dots - 1].length; i++) {
        let position = POSITIONS[dots - 1][i];
        drawDot(context, (x + (quadSize * position.multX)), (y + (quadSize * position.multY)), quadSize);
    }
}

function drawDot(context, quadX, quadY, size) {
    let half = size / 2;
    context.beginPath();
    context.arc((quadX + half), (quadY + half), Math.floor(size / 3), 0, Math.PI * 2);
    let gradient = context.createRadialGradient((quadX + half), (quadY + half), half, (quadX + half), (quadY + half), half / 4);
    gradient.addColorStop(0, 'rgb(217, 102, 89)');
    gradient.addColorStop(1, 'rgb(208, 63, 47)');
    context.fillStyle = gradient;
    context.fill();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
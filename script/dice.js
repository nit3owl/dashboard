"use strict";

class Position {
    constructor(multX, multY) {
        this.multX = multX;
        this.multY = multY;
    }
}

const one = new Position(0, 0);
const three = new Position(2, 0);
const four = new Position(0, 1);
const five = new Position(1, 1);
const six = new Position(2, 1);
const seven = new Position(0, 2);
const nine = new Position(2, 2);

const positions = [
    [five],
    [three, seven],
    [three, five, seven],
    [one, three, seven, nine],
    [one, three, five, seven, nine],
    [one, three, four, six, seven, nine]
];

function drawDie(canvas, x, y, size) {
    if (canvas.getContext) {
        let context = canvas.getContext('2d');
        let dots = randomInt(1, 7);
        drawSide(context, x, y, size, dots);
    } else {
        //do fallback render
    }
}

function drawSide(context, x, y, size, dots) {
    //create outline
    context.fillStyle = 'rgb(192,57,43)';
    context.fillRect(x, y, size, size);

    context.clearRect(x + 2, y + 2, size - 4, size - 4);

    //render dots
    let quadSize = size / 3;

    for (let i = 0; i < positions[dots - 1].length; i++) {
        let position = positions[dots - 1][i];
        drawDot(context, (x + (quadSize * position.multX)), (y + (quadSize * position.multY)), quadSize);
    }
}

function drawDot(context, quadX, quadY, size) {
    let half = size / 2;
    context.beginPath();
    context.arc((quadX + half), (quadY + half), 7, 0, Math.PI * 2);
    context.fill();
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}
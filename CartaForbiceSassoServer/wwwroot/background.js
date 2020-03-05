let colorFilters = [
    1.9, 1.75, 1.6, 1.45, 1.3, 0.0, 0.3, 0.45, 0.6, 0.75, 0.9
];

let colorUsed = [];

let width = 1920;
let height = 1080;

let mainColor = "#c703b7";
let colorRandomness = 0.2;

let initTriangleHeight = 56;
let initTriangleBase = 56;

let columnNumber = 40;
let rowNumber = 40;

let triangleHeight;
let triangleBase;

let canvas;
let ctx;

function init() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    setInterval(draw, 2000);

    setInterval(() => {
        const r = Math.round(Math.random() * 255);
        const g = Math.round(Math.random() * 255);
        const b = Math.round(Math.random() * 255);

        mainColor = `rgb(${r}, ${g}, ${b})`;
    }, 2000);

    resize();
}

function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    ctx.canvas.width  = width;
    ctx.canvas.height = height;

    columnNumber = canvas.clientWidth / initTriangleHeight;
    rowNumber = 2 * canvas.clientHeight / initTriangleBase;

    triangleHeight = width / Math.trunc(columnNumber);
    triangleBase = height / (Math.trunc(rowNumber) / 2);

    draw();
}

function draw() {

    ctx.fillStyle = mainColor;
    ctx.fillRect(0, 0, width, height);

    let yInit = 0;
    let xInit = 0;
    for (let rInx = 0; rInx <= rowNumber; rInx++) {
        let isRight = rInx % 2 == 0 ? true : false;
        for (let cInx = 0; cInx < columnNumber; cInx++) {
            drawTriangle(
                xInit, yInit,
                triangleHeight, triangleBase,
                isRight,
                rInx == 0 || rInx == rowNumber
            );

            let color = pickTriangleColor(rInx, cInx, columnNumber);
            colorTriangle(color);

            xInit += triangleHeight;
            isRight = !isRight;
        }

        xInit = 0;
        yInit += triangleBase / 2;
    }
}

function drawTriangle(xInit, yInit, height, base, isRight, isHalf) {
    if (isRight) {
        if (isHalf) {
            if (yInit == 0) {
                ctx.beginPath();
                ctx.moveTo(xInit, yInit);
                ctx.lineTo(xInit + height, yInit);
                ctx.lineTo(xInit, yInit + base / 2);
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.moveTo(xInit, yInit);
                ctx.lineTo(xInit, yInit - base / 2);
                ctx.lineTo(xInit + height, yInit);
                ctx.closePath();
            }
        } else {
            ctx.beginPath();
            ctx.moveTo(xInit, yInit - base / 2);
            ctx.lineTo(xInit + height, yInit);
            ctx.lineTo(xInit, yInit + base / 2);
            ctx.closePath();
        }
    } else {
        if (isHalf) {
            if (yInit == 0) {
                ctx.beginPath();
                ctx.moveTo(xInit, yInit);
                ctx.lineTo(xInit + height, yInit);
                ctx.lineTo(xInit + height, yInit + base / 2);
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.moveTo(xInit, yInit);
                ctx.lineTo(xInit + height, yInit - base / 2);
                ctx.lineTo(xInit + height, yInit);
                ctx.closePath();
            }
        } else {
            ctx.beginPath();
            ctx.moveTo(xInit, yInit);
            ctx.lineTo(xInit + height, yInit - base / 2);
            ctx.lineTo(xInit + height, yInit + base / 2);
            ctx.closePath();

        }
    }
}

function colorTriangle(color) {
    // the fill color
    ctx.globalAlpha = color > 1 ? color - 1 : color;
    ctx.fillStyle = colorToRGB(color);
    ctx.fill();
}

function pickTriangleColor(rowIndex, columnIndex, columnNumber) {
    const colorsToCheck = [];

    if (columnIndex - 1 >= 0)
        colorsToCheck.push(colorUsed[columnNumber * rowIndex + columnIndex - 1]);
    if (rowIndex - 1 >= 0)
        colorsToCheck.push(colorUsed[columnNumber * (rowIndex - 1) + columnIndex]);

    const availableColors = colorFilters.filter(color => !colorsToCheck.includes(color));
    const color = pickRandomColor(rowIndex, rowNumber, availableColors);

    colorUsed[columnNumber * rowIndex + columnIndex] = color;

    return color;
}

function pickRandomColor(rowIndex, rowNumber, availableColors) {
    const randomPick = Math.max(Math.min(normal(rowIndex / rowNumber, colorRandomness, 12), 1), 0);
    const color = availableColors[Math.trunc(randomPick * (availableColors.length - 1))];

    return color;
}

function colorToRGB(color) {
    const value = 255 * Math.floor(color)
    return `rgb(${value}, ${value}, ${value})`
}

function normal(mu = 0, sigma = 1, nsamples = 6) {
    let run_total = 0

    for (let i = 0; i < nsamples; i++) {
        run_total += Math.random()
    }

    return sigma * (run_total - nsamples / 2) / (nsamples / 2) + mu
}

window.addEventListener("load", init);
window.addEventListener("resize", resize);

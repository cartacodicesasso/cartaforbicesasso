var colorFilters = [
    1.9, 1.75, 1.6, 1.45, 1.3, 0.0, 0.3, 0.45, 0.6, 0.75, 0.9
];

var colorUsed = [];

var width = 0;
var height = 0;

var columnNumber = 35;
var rowNumber = 20;

var mainColor = "#c703b7";
var colorRandomness = 0.2;

var triangleHeight = 55;
var triangleBase = 54;

var ctx;

function init() {
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    setInterval(() => { draw(ctx); }, 2000);

    resize();
}

function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    ctx.canvas.width  = width;
    ctx.canvas.height = height;

    draw(ctx);
}

function draw(ctx) {

    ctx.fillStyle = mainColor;
    ctx.fillRect(0,0,width, height);

    columnNumber = width / triangleHeight;
    rowNumber = height / triangleBase;

    for(var cInx = 0; cInx < columnNumber; cInx++) {
        drawTrianglesColumn(ctx, cInx, triangleHeight, triangleBase, rowNumber);
    }
}

function drawTrianglesColumn(context, columnIndex, triangleHeight, triangleBase, rowNumber) {

    xInit = triangleHeight * columnIndex;
    var yInit = 0;

    var drawOneColumSide = function(isLeft) {
        yInit = 0;
        for(var rInx = 0; rInx <= rowNumber; rInx++) {
            var odd = (columnIndex % 2 != 0);
            drawTriangle(context, xInit, yInit, triangleHeight, triangleBase, rInx, odd, isLeft);
            var colorCInx = columnIndex * 2 + (isLeft ? 1 : 0);
            var color = pickTriangleColor(rInx, colorCInx, rowNumber, isLeft);
            colorTriangle(context, color);
            yInit += (rInx == 0 && ((!odd && !isLeft) || (odd && isLeft)) ? triangleBase / 2 : triangleBase);
        }
    }

    drawOneColumSide(false);
    drawOneColumSide(true);
}

function drawTriangle(context, xInit, yInit, height, base, rowInx, odd, isLeft) {
    if(isLeft) {
        if(rowInx == 0 && odd) {
            // the triangle
            context.beginPath();
            context.moveTo(xInit, yInit);
            context.lineTo(xInit + height, yInit);
            context.lineTo(xInit + height, yInit + base / 2);
            context.closePath();
        } else if(rowInx < rowNumber) {
            // the triangle
            context.beginPath();
            context.moveTo(xInit + height, yInit);
            context.lineTo(xInit, yInit + base / 2);
            context.lineTo(xInit + height, yInit + base);
            context.closePath();
        } else if(rowInx == rowNumber && odd) {
            // the triangle
            context.beginPath();
            context.moveTo(xInit + height, yInit);
            context.lineTo(xInit, yInit + base / 2);
            context.lineTo(xInit + height, yInit + base / 2);
            context.closePath();
        }
    } else {
        if(rowInx == 0 && !odd) {
            // the triangle
            context.beginPath();
            context.moveTo(xInit, yInit);
            context.lineTo(xInit + height, yInit);
            context.lineTo(xInit, yInit + base / 2);
            context.closePath();
        } else if(rowInx < rowNumber) {
            // the triangle
            context.beginPath();
            context.moveTo(xInit, yInit);
            context.lineTo(xInit, yInit + base);
            context.lineTo(xInit + height, yInit + base / 2);
            context.closePath();
        } else if(rowInx == rowNumber && !odd) {
            // the triangle
            context.beginPath();
            context.moveTo(xInit, yInit);
            context.lineTo(xInit + height, yInit + base / 2);
            context.lineTo(xInit, yInit + base / 2);
            context.closePath();
        }
    }
}

function colorTriangle(context, color) {
    // the fill color
    context.globalAlpha = color > 1 ? color -1 : color;
    context.fillStyle = colorToRGB(color);
    context.fill();
}

function pickTriangleColor(rowIndex, columnIndex, rowNumber, isLeft) {
    var colorsToCheck = [];
    if(isLeft) {
        if(rowIndex -1 >= 0 && columnIndex -1 > 0)
            colorsToCheck.push(colorUsed[(rowIndex -1) + ((columnIndex -1) * rowNumber)]);
        if(columnIndex -1 >= 0) {
            colorsToCheck.push(colorUsed[rowIndex + ((columnIndex -1) * rowNumber)]);
            colorsToCheck.push(colorUsed[rowIndex + 1 + ((columnIndex -1) * rowNumber)]);
        }
        if(columnIndex -3 >= 0)
            colorsToCheck.push(colorUsed[rowIndex + ((columnIndex -3) * rowNumber)]);
    } else {
        if(columnIndex -1 >= 0)
            colorsToCheck.push(colorUsed[rowIndex + ((columnIndex -1) * rowNumber)]);
        if(rowIndex -1 >= 0)
            colorsToCheck.push(colorUsed[(rowIndex -1) + (columnIndex * rowNumber)]);
    }

    var availableColors = [];
    for(var colorFilter of colorFilters) {
        var find = false;
        for(var colorToCheck of colorsToCheck ) {
            if(colorFilter == colorToCheck) {
                find = true;
                break;
            }
        }

        if(!find)
            availableColors.push(colorFilter);
    }

    var color = pickRandomColor(rowIndex, rowNumber, availableColors);
    colorUsed[rowIndex + (rowNumber * columnIndex)] = color;
    return color;
}

function pickRandomColor(rowIndex, rowNumber, availableColors) {
    var randomPick = normal(rowIndex / rowNumber, colorRandomness, 12);
    if(randomPick < 0)
        randomPick = 0;
    if(randomPick > 1)
        randomPick = 1;

    var color = availableColors[Math.trunc(randomPick * (availableColors.length -1))];

    return color;
}

function colorToRGB(color) {
    return color > 1 ?
        'rgb(' + 255  + ', ' + 255 + ', ' + 255 + ')'
        :
        'rgb(' + 0  + ', ' + 0 + ', ' + 0 + ')';
}

function normal(mu = 0, sigma = 1, nsamples = 6){
    var run_total = 0
    for(var i=0 ; i<nsamples ; i++){
       run_total += Math.random()
    }

    return sigma*(run_total - nsamples/2)/(nsamples/2) + mu
}

window.addEventListener("load", init);
window.addEventListener("resize", resize);

const WIDTH: number = 10;
const HEIGHT: number = 100;
const GRADE: number = 5;
let VALUES_LENGTH: number = 6;
let SPEED: number = 5000;

let VALUES: number[][] = [];

let koeffizienten: number[][] = []; //[[ZAHL, FAKTOR]]
function setup(): void {
    if (VALUES_LENGTH < 0) VALUES_LENGTH = Math.round(getRandom(1, 10));
    for (let i: number = 0; i < VALUES_LENGTH; i++) {
        VALUES[i] = [Math.round(random(WIDTH)), Math.round(random(HEIGHT))];
    }

    createCanvas(windowWidth, windowHeight);
    for (let i: number = 0; i <= GRADE; i++) {
        koeffizienten[i] = [0, 1];
    }
}

function draw(): void {
    background(220);
    drawGraph();
    drawPlot();
    drawGUI([
        `Werte (${VALUES_LENGTH}): ${arrToString(VALUES)}`,
        `Delta: ${calcV()}`,
        `Width: ${WIDTH}`,
        `Height: ${HEIGHT}`,
        `Grad: ${GRADE}`,
        `f(x) = ${fToString()}`
    ]);
    if (frameCount > 1) calc();
}
function f(x: number): number {
    let sum = 0;
    for (let i: number = 0; i < koeffizienten.length; i++) {
        sum += koeffizienten[i][0] * (x ** i);
    }
    return sum;
}
function drawGraph(): void {
    let x1: number;
    let x2: number;
    let y1: number;
    let y2: number;
    for (let i = 0; i < width; i++) {
        x1 = i * (WIDTH / width);
        x2 = (i + 1) * (WIDTH / width);
        y1 = f(x1) * (height / HEIGHT);
        y2 = f(x2) * (height / HEIGHT);
        line(i, height - y1, i + 1, height - y2);
    }
}
function drawPoint(x: number, y: number): void {
    x *= width / WIDTH;
    y *= height / HEIGHT;
    fill('red');
    ellipse(x, height - y, 6);
}
function drawPlot(): void {
    for (let i: number = 0; i < VALUES.length; i++) {
        drawPoint(VALUES[i][0], VALUES[i][1]);
    }
}
function calc(): void {
    for (let j: number = 0; j < SPEED; j++) {
        for (let i: number = 0; i < koeffizienten.length; i++) {
            improveKO(i);
        }
    }
}
function improveKO(i: number): void {
    let faktor: number = koeffizienten[i][1];

    let origV: number = calcV();
    koeffizienten[i][0] += faktor;

    let plusV: number = calcV();
    koeffizienten[i][0] -= 2 * faktor;

    let minusV: number = calcV();
    koeffizienten[i][0] += faktor;

    if (plusV < origV) {
        koeffizienten[i][0] += faktor;
        koeffizienten[i][1] *= 2;
    } else if (minusV < origV) {
        koeffizienten[i][0] -= faktor;
        koeffizienten[i][1] *= 2;
    } else if (koeffizienten[i][1] * 0.5 > 0) {
        koeffizienten[i][1] *= 0.5;
    }
}
function calcV(): number {
    let n: number = 0;
    let linearDelta: number;
    for (let i: number = 0; i < VALUES.length; i++) {
        linearDelta = Math.abs(VALUES[i][1] - f(VALUES[i][0]));
        n += linearDelta ** 2;
    }
    return n;
}
function drawGUI(inp: string[]): void {
    for (let i: number = 0; i < inp.length; i++) {
        fill(0);
        text(inp[i], 5, 15 + 20 * i);
    }
}
function fToString(): string {
    let arr: number[] = koeffizienten.map(function (v: number[]): number { return v[0] });
    let arr_str: string[] = [];
    for (let i: number = 0; i < arr.length; i++) {
        arr_str[i] = Math.round(arr[i]) + "x^" + i;
    }
    arr_str.reverse();
    return arr_str.join(" + ");
}
function arrToString(arr: number[][]): string {
    let arr_str: string[] = [];
    for (let i: number = 0; i < arr.length; i++) {
        arr_str[i] = `[${arr[i][0]}, ${arr[i][1]}]`;
    }
    return arr_str.join(", ");
}
function getRandom(min: number = 0, max: number = 100): number {
    if (min >= max) return min;
    return min + Math.random() * (max - min);
}
const WIDTH: number = 10;
const HEIGHT: number = 100;
const VALUES: number[][] = [
    [9, 80],
    [5, 50],
    [4, 40],
    [1, 70],
    [0.5, 30]
];
const efficiency: number = 1000;
const quadV: boolean = true;


let koeffizienten: number[][] = [[]]; //[[ZAHL, FAKTOR]]
let grad: number = 4;
function setup(): void {
    // @ts-ignore
    createCanvas(windowWidth, windowHeight);
    // @ts-ignore
    frameRate(100);
    for (let i: number = 0; i <= grad; i++) {
        koeffizienten[i] = [10, 10];
    }
}

function draw(): void {
    // @ts-ignore
    background(220);
    drawGraph();
    drawPlot();
    drawGUI([
        "V: " + calcV(),
        "Width: " + WIDTH,
        "Height: " + HEIGHT,
        "Grad: " + grad,
        "f(x) = " + fToString()
    ]);
    calc();
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
    // @ts-ignore
    for (let i = 0; i < width - 1; i++) {
        // @ts-ignore
        x1 = i * (WIDTH / width);
        // @ts-ignore
        x2 = (i + 1) * (WIDTH / width);
        // @ts-ignore
        y1 = f(x1) * (height / HEIGHT);
        // @ts-ignore
        y2 = f(x2) * (height / HEIGHT);
        // @ts-ignore
        line(i, height - y1, i + 1, height - y2);
    }
}
function drawPoint(x: number, y: number): void {
    // @ts-ignore
    x *= width / WIDTH;
    // @ts-ignore
    y *= height / HEIGHT;
    // @ts-ignore
    noFill();
    // @ts-ignore
    ellipse(x, height - y, 4);
}
function drawPlot(): void {
    for (let i: number = 0; i < VALUES.length; i++) {
        drawPoint(VALUES[i][0], VALUES[i][1]);
    }
}
function calc(): void {
    let a: number;
    let b: number;
    let orig: number;
    let faktor: number;
    for (let j: number = 0; j < efficiency; j++) {
        for (let i: number = 0; i < koeffizienten.length; i++) {
            faktor = koeffizienten[i][1];
            orig = calcV();
            koeffizienten[i][0] += faktor;
            a = calcV();
            koeffizienten[i][0] -= 2 * faktor;
            b = calcV();
            koeffizienten[i][0] += faktor;

            if (a < orig) {
                koeffizienten[i][0] += faktor;
                koeffizienten[i][1] *= 2;
            } else if (b < orig) {
                koeffizienten[i][0] -= faktor;
                koeffizienten[i][1] *= 2;
            } else {
                koeffizienten[i][1] *= 0.5;
            }
        }
    }
}
function calcV(): number {
    let n: number = 0;
    let s: number;
    for (let i: number = 0; i < VALUES.length; i++) {
        s = Math.abs(VALUES[i][1] - f(VALUES[i][0]));
        n += quadV ? s ** 2 : s;
    }
    return n;
}
function drawGUI(inp: string[]): void {
    for (let i: number = 0; i < inp.length; i++) {
        // @ts-ignore
        fill(0);
        // @ts-ignore
        text(inp[i], 10, 10 + 20 * i);
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

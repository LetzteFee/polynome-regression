const WIDTH: number = 10;
const HEIGHT: number = 100;
let VALUES: number[][] = [];
const efficiency: number = 10000;
const quadV: boolean = true;


let koeffizienten: number[][] = []; //[[ZAHL, FAKTOR]]
function setup(): void {
    // @ts-ignore
    let len: number = Math.round(random(10));
    for (let i: number = 0; i < len; i++) {
        // @ts-ignore
        VALUES[i] = [Math.round(WIDTH * (i / (len - 1))), Math.round(random(HEIGHT))];
    }


    // @ts-ignore
    createCanvas(windowWidth, windowHeight);
    // @ts-ignore
    frameRate(100);
    for (let i: number = 0; i <= VALUES.length; i++) {
        koeffizienten[i] = [10, 10];
    }
}

function draw(): void {
    // @ts-ignore
    background(220);
    drawGraph();
    drawPlot();
    drawGUI([
        "Werte: " + arrToString(VALUES),
        "V: " + calcV(),
        "Width: " + WIDTH,
        "Height: " + HEIGHT,
        "Grad: " + (koeffizienten.length - 1),
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
    fill('red');
    // @ts-ignore
    ellipse(x, height - y, 4);
}
function drawPlot(): void {
    for (let i: number = 0; i < VALUES.length; i++) {
        drawPoint(VALUES[i][0], VALUES[i][1]);
    }
}
function calc(): void {
    let plusV: number;
    let minusV: number;
    let origV: number;
    let faktor: number;
    // @ts-ignore
    let len: number = efficiency > 0 ? efficiency : frameCount;
    for (let j: number = 0; j < len; j++) {
        for (let i: number = 0; i < koeffizienten.length; i++) {
            faktor = koeffizienten[i][1];

            origV = calcV();
            koeffizienten[i][0] += faktor;
            plusV = calcV();
            koeffizienten[i][0] -= 2 * faktor;
            minusV = calcV();
            koeffizienten[i][0] += faktor;

            if (plusV < origV) {
                koeffizienten[i][0] += faktor;
                koeffizienten[i][1] *= 2;
            } else if (minusV < origV) {
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
function arrToString(arr: number[][]): string {
    let arr_str: string[] = [];
    for (let i: number = 0; i < arr.length; i++) {
        arr_str[i] = `[${arr[i][0]}, ${arr[i][1]}]`;
    }
    return arr_str.join(", ");
}
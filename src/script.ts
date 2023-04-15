class Point {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public calcDelta(): number {
        return Math.abs(this.y - f(this.x)) ** 2;
    }
    public draw(): void {
        noStroke();
        fill('red');
        ellipse(
            this.x * (width / WIDTH),
            height - (this.y * (height / HEIGHT)),
            5
        );
    }
    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}

class Koeffizient {
    public value: number;
    public sum: number;
    private resets: number;
    constructor(v: number, sum: number) {
        this.value = v;
        this.sum = sum;

        this.resets = 0;
    }
    private resetSum(): void {
        this.sum = 1;
        this.resets++;
        console.log(this.resets);
    }
    private increaseSum(): void {
        this.sum *= 2;
    }
    private decreaseSum(): void {
        this.sum *= 0.5;
    }
    public improve(): void {
        let origV: number = calcCompleteDelta();
        this.value += this.sum;

        let plusV: number = calcCompleteDelta();
        this.value -= 2 * this.sum;

        let minusV: number = calcCompleteDelta();
        this.value += this.sum;

        if (plusV < origV) {
            this.value += this.sum;
            this.increaseSum();
        } else if (minusV < origV) {
            this.value -= this.sum;
            this.increaseSum();
        } else if (this.sum * 0.5 > 0) {
            this.decreaseSum();
        } else {
            this.resetSum();
        }
    }
}

const WIDTH: number = 10;
const HEIGHT: number = 100;
const GRADE: number = 5;
let SPEED: number = 5000;

let VALUES: Point[] = [];
let koeffizienten: Koeffizient[] = [];

function setup(): void {
    let VALUES_LENGTH: number = 6;
    for (let i: number = 0; i < VALUES_LENGTH; i++) {
        VALUES.push(new Point(WIDTH / VALUES_LENGTH * i + WIDTH / VALUES_LENGTH * 0.5, random(HEIGHT)));
    }

    for (let i: number = 0; i <= GRADE; i++) {
        koeffizienten.push(new Koeffizient(0, 1));
    }

    createCanvas(windowWidth, windowHeight);
}
function draw(): void {
    background(220);
    drawGUI();

    for (let j: number = 0; j < SPEED; j++) {
        for (let i: number = 0; i < koeffizienten.length; i++) {
            koeffizienten[i].improve();
        }
    }
}
function f(x: number): number {
    let sum = 0;
    for (let i: number = 0; i < koeffizienten.length; i++) {
        sum += koeffizienten[i].value * (x ** i);
    }
    return sum;
}
function calcCompleteDelta(): number {
    let n: number = 0;
    for (let i: number = 0; i < VALUES.length; i++) {
        n += VALUES[i].calcDelta();
    }
    return n;
}
function drawGUI(): void {
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
            stroke(0);
            line(i, height - y1, i + 1, height - y2);
        }
    }
    function drawPlot(): void {
        for (let i: number = 0; i < VALUES.length; i++) {
            VALUES[i].draw();
        }
    }
    function fToString(): string {
        let arr_str: string[] = [];
        for (let i: number = 0; i < koeffizienten.length; i++) {
            arr_str.push(Math.round(koeffizienten[i].value) + "x^" + i);
        }
        arr_str.reverse();
        return arr_str.join(" + ");
    }

    drawGraph();
    drawPlot();

    let inp: string[] = [
        `Werte (${VALUES.length}): ${VALUES.map(v => v.toString()).join(", ")}`,
        `Delta: ${calcCompleteDelta()}`,
        `Width: ${WIDTH}`,
        `Height: ${HEIGHT}`,
        `Grad: ${GRADE}`,
        `f(x) = ${fToString()}`
    ]
    for (let i: number = 0; i < inp.length; i++) {
        fill(0);
        text(inp[i], 5, 15 + 20 * i);
    }
}
function windowResized(): void {
    resizeCanvas(windowWidth, windowHeight);
}

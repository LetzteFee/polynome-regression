class Point {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public draw(): void {
        let x: number = this.x * (width / WIDTH);
        let y: number = height - (this.y * (height / HEIGHT));

        noStroke();
        fill('red');
        ellipse(x, y, 5);
    }
    public drawLinearDelta(funk: Polynom): void {
        let x: number = this.x * (width / WIDTH);
        let y: number = height - (this.y * (height / HEIGHT));

        stroke(0);
        line(x, y, x, height - (funk.f(this.x) * (height / HEIGHT)));
    }
    public toString(): string {
        let x: number = Math.round(this.x);
        let y: number = Math.round(this.y);
        return `(${x}, ${y})`;
    }
}

class Koeffizient {
    public value: number;
    public sum: number;
    constructor(v: number, sum: number) {
        this.value = v;
        this.sum = sum;
    }
    private resetSum(): void {
        this.sum = 1;
    }
    private increaseSum(): void {
        this.sum *= 2;
    }
    private decreaseSum(): void {
        this.sum *= 0.5;
    }
    public improve(funk: Polynom): void {
        let origV: number = funk.calcCompleteDelta();

        this.value += this.sum;
        let plusV: number = funk.calcCompleteDelta();

        this.value -= 2 * this.sum;
        let minusV: number = funk.calcCompleteDelta();

        this.value += this.sum;

        if (plusV < origV) {
            this.value += this.sum;
            this.increaseSum();
        } else if (minusV < origV) {
            this.value -= this.sum;
            this.increaseSum();
        } else if (this.sum * 0.5 > 0) {
            this.decreaseSum();
            this.improve(funk);
        } else {
            this.resetSum();
        }
    }
}

class Polynom {
    private arr: Koeffizient[];
    constructor() {
        this.arr = [];
        for (let i: number = 0; i <= GRADE; i++) {
            this.arr.push(new Koeffizient(0, 1));
        }
    }
    public improve(): void {
        for (let j: number = 0; j < SPEED; j++) {
            for (let i: number = 0; i < this.arr.length; i++) {
                this.arr[i].improve(this);
            }
        }
    }
    public f(x: number): number {
        let sum = 0;
        for (let i: number = 0; i < this.arr.length; i++) {
            sum += this.arr[i].value * (x ** i);
        }
        return sum;
    }
    public fToString(): string {
        let arr_str: string[] = [];
        for (let i: number = 0; i < this.arr.length; i++) {
            arr_str.push(Math.round(this.arr[i].value) + "x^" + i);
        }
        arr_str.reverse();
        return arr_str.join(" + ");
    }
    public drawGraph(): void {
        let x1: number;
        let x2: number;
        let y1: number;
        let y2: number;
        for (let i = 0; i < width; i++) {
            x1 = i * (WIDTH / width);
            x2 = (i + 1) * (WIDTH / width);
            y1 = this.f(x1) * (height / HEIGHT);
            y2 = this.f(x2) * (height / HEIGHT);
            stroke(0);
            line(i, height - y1, i + 1, height - y2);
        }
    }
    public calcCompleteDelta(): number {
        let n: number = 0;
        for (let i: number = 0; i < VALUES.length; i++) {
            n += Math.abs(VALUES[i].y - this.f(VALUES[i].x)) ** 2;
        }
        return n;
    }
}
const WIDTH: number = 10;
const HEIGHT: number = 100;
const GRADE: number = 6;
let SPEED: number = 5000;

let VALUES: Point[] = [];
let funktion01: Polynom;

function setup(): void {
    let VALUES_LENGTH: number = GRADE + 1;
    for (let i: number = 0; i < VALUES_LENGTH; i++) {
        VALUES.push(new Point(WIDTH / VALUES_LENGTH * i + WIDTH / VALUES_LENGTH * 0.5, random(HEIGHT)));
    }

    funktion01 = new Polynom();

    createCanvas(windowWidth, windowHeight);
}
function draw(): void {
    background(220);
    render();
    funktion01.improve();
}
function render(): void {
    function drawPlot(): void {
        for (let i: number = 0; i < VALUES.length; i++) {
            VALUES[i].draw();
            VALUES[i].drawLinearDelta(funktion01);
        }
    }

    function listVALUES(): string {
        return VALUES.map(v => v.toString()).join(", ");
    }
    funktion01.drawGraph();
    drawPlot();

    let inp: string[] = [
        `Werte (${VALUES.length}): ${listVALUES()}`,
        `Delta: ${funktion01.calcCompleteDelta()}`,
        `Width: ${WIDTH}`,
        `Height: ${HEIGHT}`,
        `Grad: ${GRADE}`,
        `f(x) = ${funktion01.fToString()}`
    ]
    for (let i: number = 0; i < inp.length; i++) {
        noStroke();
        fill(0);
        text(inp[i], 5, 15 + 20 * i);
    }
}
function windowResized(): void {
    resizeCanvas(windowWidth, windowHeight);
}

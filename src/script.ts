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
    public improve(funk: Polynom, data: Point[]): void {
        let origV: number = funk.calcCompleteDelta(data);

        this.value += this.sum;
        let plusV: number = funk.calcCompleteDelta(data);

        this.value -= 2 * this.sum;
        let minusV: number = funk.calcCompleteDelta(data);

        this.value += this.sum;

        if (plusV < origV) {
            this.value += this.sum;
            this.increaseSum();
        } else if (minusV < origV) {
            this.value -= this.sum;
            this.increaseSum();
        } else if (this.sum * 0.5 > 0) {
            this.decreaseSum();
            this.improve(funk, data);
        } else {
            this.resetSum();
        }
    }
}

class Polynom {
    private arr: Koeffizient[];
    private delta_expo: number;
    private readonly color: string;
    constructor(grad: number, expo: number, color: string) {
        this.arr = [];
        for (let i: number = 0; i <= grad; i++) {
            this.arr.push(new Koeffizient(0, 1));
        }

        this.delta_expo = expo;
        this.color = color;
    }
    public improve(data: Point[]): void {
        for (let j: number = 0; j < 5000; j++) {
            for (let i: number = 0; i < this.arr.length; i++) {
                this.arr[i].improve(this, data);
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
        for (let i = 0; i < width; i++) {
            let x1: number = i * (WIDTH / width);
            let x2: number = (i + 1) * (WIDTH / width);
            let y1: number = this.f(x1) * (height / HEIGHT);
            let y2: number = this.f(x2) * (height / HEIGHT);
            stroke(this.color);
            line(i, height - y1, i + 1, height - y2);
        }
    }
    public calcCompleteDelta(data: Point[], expo: number = this.delta_expo): number {
        let n: number = 0;
        for (let i: number = 0; i < data.length; i++) {
            n += Math.abs(data[i].y - this.f(data[i].x)) ** expo;
        }
        return n;
    }
    public getGrad(): number {
        return this.arr.length - 1;
    }
    public getExpo(): number {
        return this.delta_expo;
    }
    public getColor(): string {
        return this.color;
    }
    public toString(): string {
        return `${this.getColor()}: Grad: ${this.getGrad()}, Delta-Expo: ${this.getExpo()}, LinearDelta: ${this.calcCompleteDelta(VALUES, 1)}`;
    }
}
const WIDTH: number = 10;
const HEIGHT: number = 100;

let VALUES: Point[] = [];
let funktionen: Polynom[] = [];

function setup(): void {
    let GRAD: number = 6;
    funktionen = [
        new Polynom(GRAD, 2, "green"),
        new Polynom(GRAD, 3, "red"),
        new Polynom(GRAD, 4, "blue")
    ];

    let VALUES_LENGTH: number = GRAD + 1;
    for (let i: number = 0; i < VALUES_LENGTH; i++) {
        VALUES.push(new Point(WIDTH / VALUES_LENGTH * i + WIDTH / VALUES_LENGTH * 0.5, random(HEIGHT)));
    }

    createCanvas(windowWidth, windowHeight);
}
function draw(): void {
    background(220);
    render();
    for (let i = 0; i < funktionen.length; i++) {
        funktionen[i].improve(VALUES);
    }
}
function render(): void {
    for (let i: number = 0; i < VALUES.length; i++) {
        VALUES[i].draw();
        //VALUES[i].drawLinearDelta(funktion01);
    }
    for (let i = 0; i < funktionen.length; i++) {
        funktionen[i].drawGraph();
    }

    /*let zeilen: string[] = [
        `Punkte (${VALUES.length}): ${VALUES.map(v => v.toString()).join(", ")}`,
        `Delta: ${funktion01.calcCompleteDelta(VALUES)}`,
        `Width: ${WIDTH}`,
        `Height: ${HEIGHT}`,
        `Grad: ${funktion01.getGrad()}`,
        `f(x) = ${funktion01.fToString()}`
    ]*/
    for (let i: number = 0; i < funktionen.length; i++) {
        noStroke();
        fill(0);
        text(funktionen[i].toString(), 5, 15 + 20 * i);
    }
}
function windowResized(): void {
    resizeCanvas(windowWidth, windowHeight);
}

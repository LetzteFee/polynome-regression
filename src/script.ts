interface color {
    r: number,
    g: number,
    b: number
}
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
    public toString(): string {
        let x: number = Math.round(this.x);
        let y: number = Math.round(this.y);
        return `(${x}, ${y})`;
    }
}
type Plot = Point[];
class Koeffizient {
    public value: number;
    public sum: number;
    private resets: number;
    constructor(v: number, sum: number) {
        this.value = v;
        this.sum = sum;
        this.resets = 1;
    }
    public resetSum(): void {
        this.sum = this.resets ** 2;
    }
    public increaseSum(): void {
        this.sum *= 2;
    }
    public decreaseSum(): void {
        this.sum *= 0.5;
    }
    public increaseValue(): void {
        this.value += this.sum;
    }
    public decreaseValue(): void {
        this.value -= this.sum;
    }
    public sumHighEnough(): boolean {
        return this.sum * 0.5 > 0;
    }
}

class Polynom {
    private arr: Koeffizient[];
    private training_data: Plot;
    private delta_expo: number;
    public readonly color: color;
    private calculationsPerCall: number;
    constructor(grad: number, expo: number, color: color, data: Plot, depth: number) {
        this.training_data = data;
        this.arr = [];
        for (let i: number = 0; i <= grad; i++) {
            this.arr.push(new Koeffizient(0, 1));
        }

        this.delta_expo = expo;
        this.color = color;
        this.calculationsPerCall = depth;
    }
    public improve(): void {
        for (let j: number = 0; j < this.calculationsPerCall; j++) {
            for (let i: number = 0; i < this.arr.length; i++) {
                this.improveSpecificKO(i);
            }
        }
    }
    public improveSpecificKO(index: number): void {
        let origDelta: number = this.calcCompleteDelta();
        let origValue: number = this.arr[index].value;
        let plusDelta: number;
        let minusDelta: number

        this.arr[index].increaseValue();
        plusDelta = this.calcCompleteDelta();
        this.arr[index].value = origValue;

        this.arr[index].decreaseValue();
        minusDelta = this.calcCompleteDelta();
        this.arr[index].value = origValue;

        if (plusDelta < origDelta && plusDelta < minusDelta) {
            this.arr[index].increaseValue();
            this.arr[index].increaseSum();
        } else if (minusDelta < origDelta) {
            this.arr[index].decreaseValue();
            this.arr[index].increaseSum();
        } else if (this.arr[index].sumHighEnough()) {
            this.arr[index].decreaseSum();
            //this.improveSpecificKO(index);
        } else {
            this.arr[index].resetSum();
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
        stroke(this.color.r, this.color.g, this.color.b);
        for (let i = 0; i < width; i++) {
            let x1: number = i * (WIDTH / width);
            let x2: number = (i + 1) * (WIDTH / width);
            let y1: number = this.f(x1) * (height / HEIGHT);
            let y2: number = this.f(x2) * (height / HEIGHT);
            line(i, height - y1, i + 1, height - y2);
        }
    }
    public drawLinearDelta(): void {
        for (let i: number = 0; i < this.training_data.length; i++) {
            let x: number = this.training_data[i].x * (width / WIDTH);
            let y: number = height - (this.training_data[i].y * (height / HEIGHT));

            stroke(0);
            line(x, y, x, height - this.f(this.training_data[i].x) * (height / HEIGHT));
        }
    }
    public calcCompleteDelta(expo: number = this.delta_expo): number {
        let n: number = 0;
        for (let i: number = 0; i < this.training_data.length; i++) {
            n += Math.abs(this.training_data[i].y - this.f(this.training_data[i].x)) ** expo;
        }
        return n;
    }
    public calcAverageDelta(expo: number = this.delta_expo): number {
        return this.calcCompleteDelta(expo) / this.arr.length;
    }
    public calcCompleteLinearDelta(): number {
        return this.calcCompleteDelta(1);
    }
    public getGrad(): number {
        return this.arr.length - 1;
    }
    public getExpo(): number {
        return this.delta_expo;
    }
    /*public colorToString(): string {
        return `r: ${this.color.r} g: ${this.color.g} b: ${this.color.b}`;
    }*/
    public toString(): string {
        return `Grad: ${this.getGrad()}, Delta-Expo: ${this.getExpo()}, Delta: ${this.calcCompleteDelta()}, LinearDelta: ${this.calcCompleteLinearDelta()}`;
    }
}
const WIDTH: number = 10;
const HEIGHT: number = 100;

let VALUES: Plot = [];
let funktionen: Polynom[] = [];

function setup(): void {
    const GRAD: number = 6;
    const VALUES_LENGTH: number = GRAD + 1;
    for (let i: number = 0; i < VALUES_LENGTH; i++) {
        VALUES.push(new Point(WIDTH / VALUES_LENGTH * i + WIDTH / VALUES_LENGTH * 0.5, random(HEIGHT)));
    }

    funktionen = [
        new Polynom(GRAD, 1, { r: 0, g: 0, b: 0 }, VALUES, 50),
        new Polynom(GRAD, 2, { r: 0, g: 128, b: 0 }, VALUES, 2000),
        new Polynom(GRAD, 3, { r: 255, g: 0, b: 0 }, VALUES, 2000),
        //new Polynom(GRAD, 4, { r: 0, g: 0, b: 255 }, VALUES, 1000)
    ];

    createCanvas(windowWidth, windowHeight);
}
function draw(): void {
    background(220);
    render();
    for (let i = 0; i < funktionen.length; i++) {
        funktionen[i].improve();
    }
}
function render(): void {
    for (let i: number = 0; i < VALUES.length; i++) {
        VALUES[i].draw();
    }
    for (let i = 0; i < funktionen.length; i++) {
        funktionen[i].drawGraph();
        funktionen[i].drawLinearDelta();
    }
    for (let i: number = 0; i < funktionen.length; i++) {
        noStroke();
        fill(funktionen[i].color.r, funktionen[i].color.g, funktionen[i].color.b);
        text(funktionen[i].toString(), 5, 15 + 20 * i);
    }
}
function windowResized(): void {
    resizeCanvas(windowWidth, windowHeight);
}

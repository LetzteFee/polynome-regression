interface color {
    r: number;
    g: number;
    b: number;
}
class Point {
    public readonly x: number;
    public readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public draw(): void {
        let x: number = this.x * (width / WIDTH);
        let y: number = height - (this.y * (height / HEIGHT));

        noStroke();
        fill("red");
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
    //TODO: value should be private
    public value: number;
    private sum: number;
    private resets: number;
    constructor(v: number, sum: number) {
        this.value = v;
        this.sum = sum;
        this.resets = 1;
    }
    public resetSum(): void {
        this.sum = this.resets ** 2;
        this.resets++;
    }
    public increaseSum(): void {
        this.sum *= 2;
    }
    public decreaseSum(): void {
        if (this.sumIsHighEnough()) {
            this.sum *= 0.5;
        }
    }
    public increaseValue(): void {
        this.value += this.sum;
    }
    public decreaseValue(): void {
        this.value -= this.sum;
    }
    public sumIsHighEnough(): boolean {
        return this.sum * 0.5 > 0;
    }
}

class Polynom {
    private arr: Koeffizient[];
    private training_data: Plot;
    private delta_expo: number;
    public readonly color: color;
    private calculationsPerCall: number;
    constructor(
        grad: number,
        expo: number,
        color: color,
        data: Plot,
        depth: number,
    ) {
        this.training_data = data;
        this.arr = [];
        for (let i: number = 0; i <= grad; i++) {
            this.arr.push(new Koeffizient(0, 1));
        }

        this.delta_expo = expo;
        this.color = color;
        this.calculationsPerCall = depth;
    }
    public static default(): Polynom {
        return new Polynom(5, 4, { r: 0, g: 0, b: 0 }, [], 1);
    }
    public improve(): void {
        for (let j: number = 0; j < this.calculationsPerCall; j++) {
            for (let i: number = 0; i < this.arr.length; i++) {
                this.improveSpecificKO(i);
            }
        }
    }
    private improveSpecificKO(index: number): void {
        let origDelta: number = this.calcCompleteDelta();
        let origValue: number = this.arr[index].value;
        let plusDelta: number;
        let minusDelta: number;

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
        } else if (this.arr[index].sumIsHighEnough()) {
            this.arr[index].decreaseSum();
            //this.improveSpecificKO(index);
        } else {
            //this.arr[index].resetSum();
            this.arr[index].increaseSum();
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
            let y1: number = height - (this.training_data[i].y * (height / HEIGHT));
            let y2: number = height - (this.f(this.training_data[i].x) * (height / HEIGHT));

            stroke(0);
            line(x, y1, x, y2);
        }
    }
    public calcCompleteDelta(expo: number = this.delta_expo): number {
        let n: number = 0;
        for (let i: number = 0; i < this.training_data.length; i++) {
            n +=
                Math.abs(this.training_data[i].y - this.f(this.training_data[i].x)) **
                expo;
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
class ExpoRegression {
    private funktionMinus: Polynom;
    private funktionPlus: Polynom;
    private value: number;
    private sum: number;
    private training_data: Plot;
    private grad: number;
    private origDelta: number;
    private depth: number;
    constructor(v: number, s: number, data: Plot, depth: number) {
        this.training_data = data;
        this.grad = this.training_data.length - 1;
        this.value = v;
        this.sum = s;
        this.depth = depth;

        this.funktionMinus = Polynom.default();
        this.funktionPlus = Polynom.default();
        this.genFunktionen();

        this.origDelta = Infinity;
    }
    public draw(): void {
        this.funktionMinus.drawGraph();
        this.funktionMinus.drawLinearDelta();
        this.funktionPlus.drawGraph();
        this.funktionPlus.drawLinearDelta();
    }
    public run(): void {


        this.funktionMinus.improve();
        this.funktionPlus.improve();
    }
    public improve(): void {
        let minusDelta: number = this.funktionMinus.calcCompleteLinearDelta();
        let plusDelta: number = this.funktionPlus.calcCompleteLinearDelta();

        if (minusDelta < this.origDelta && minusDelta < plusDelta) {
            this.value = this.funktionMinus.getExpo();
            this.sum *= 2;
            this.origDelta = minusDelta;
        } else if (plusDelta < this.origDelta) {
            this.value = this.funktionPlus.getExpo();
            //TODO: Logically this mutliplier does not make any sense
            this.sum *= 2;
            this.origDelta = plusDelta;
        } else {
            this.sum /= 2;
        }
        this.genFunktionen();
    }
    private genFunktionen(): void {
        this.funktionMinus = new Polynom(
            this.grad,
            this.value - this.sum,
            { r: 255, g: 0, b: 0 },
            this.training_data,
            this.depth,
        );
        this.funktionPlus = new Polynom(
            this.grad,
            this.value + this.sum,
            { r: 0, g: 128, b: 0 },
            this.training_data,
            this.depth,
        );
    }
    public toString(): string {
        return `Expo(${this.value}): ${this.origDelta}` +
            ` Minus(${this.funktionMinus.getExpo()}): ${this.funktionMinus.calcCompleteLinearDelta()}` +
            ` Plus(${this.funktionPlus.getExpo()}): ${this.funktionPlus.calcCompleteLinearDelta()}`;
    }
}
const WIDTH: number = 10;
const HEIGHT: number = 100;

let VALUES: Plot = [];
let regression: ExpoRegression;

function setup(): void {
    const GRAD: number = 6;
    const VALUES_LENGTH: number = GRAD + 1;
    for (let i: number = 0; i < VALUES_LENGTH; i++) {
        let x: number = WIDTH / VALUES_LENGTH * i;
        x += WIDTH / VALUES_LENGTH * 0.5;
        VALUES.push(new Point(x, random(HEIGHT)));
    }

    regression = new ExpoRegression(1, 1, VALUES, 2000);

    createCanvas(windowWidth, windowHeight);
}
function draw(): void {
    background(220);
    render();
    //TODO: put this in the .run() method
    if (frameCount % 300 == 0) {
        regression.improve();
    }
    regression.run();
}
function render(): void {
    for (let i: number = 0; i < VALUES.length; i++) {
        VALUES[i].draw();
    }
    noStroke();
    fill(0);
    text(regression.toString(), 5, 15);
    regression.draw();
    /*for (let i: number = 0; i < funktionen.length; i++) {
      noStroke();
      fill(funktionen[i].color.r, funktionen[i].color.g, funktionen[i].color.b);
      text(funktionen[i].toString(), 5, 15 + 20 * i);
  }*/
}
function windowResized(): void {
    resizeCanvas(windowWidth, windowHeight);
}

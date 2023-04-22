class Color {
  set(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  public r: number;
  public g: number;
  public b: number;
  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
  public static default(): Color {
    return new Color(255, 0, 0);
  }
  public fill(): void {
    fill(this.r, this.g, this.b);
  }
  public stroke(): void {
    stroke(this.r, this.g, this.b);
  }
}

class Point {
  public readonly x: number;
  public readonly y: number;
  protected color: Color;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.color = Color.default();
  }
  public draw(): void {
    const x: number = this.x * (width / WIDTH);
    const y: number = height - this.y * (height / HEIGHT);

    noStroke();
    this.color.fill();
    ellipse(x, y, 5);
  }
  public toString(): string {
    const x: number = Math.round(this.x);
    const y: number = Math.round(this.y);
    return `(${x}, ${y})`;
  }
}

class Plot {
  public points: Point[];
  constructor(points: Point[]) {
    this.points = points;
  }
  public static default(): Plot {
    return new Plot([]);
  }
  public static genRandomPointsFromLength(length: number): Plot {
    const shift: number = (WIDTH / length) * 0.5;
    let values: Point[] = [];

    for (let i: number = 0; i < length; i++) {
      const x: number = (WIDTH / length) * i;
      values.push(new Point(x + shift, random(HEIGHT)));
    }
    return new Plot(values);
  }
  public draw(): void {
    for (let i: number = 0; i < this.points.length; i++) {
      this.points[i].draw();
    }
  }
  public getLength(): number {
    return this.points.length;
  }
}

class Koeffizient {
  private value: number;
  private sum: number;
  private resets: number;
  private origValue: number;
  constructor(v: number, sum: number) {
    this.value = v;
    this.sum = sum;
    this.resets = 1;
    this.origValue = 0;
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
  public getValue(): number {
    return this.value;
  }
  public resetValue(): void {
    this.value = this.origValue;
  }
  public increaseValue(): void {
    this.origValue = this.value;
    this.value += this.sum;
  }
  public decreaseValue(): void {
    this.origValue = this.value;
    this.value -= this.sum;
  }
  public sumIsHighEnough(): boolean {
    return this.sum * 0.5 > 0;
  }
}

class Polynom {
  private arr: Koeffizient[];
  private readonly training_data: Plot;
  private readonly delta_expo: number;
  public readonly color: Color;
  private calculationsPerCall: number;
  constructor(
    grad: number,
    expo: number,
    color: Color,
    data: Plot,
    depth: number
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
    return new Polynom(5, 2, Color.default(), Plot.default(), 1);
  }
  public improve(): void {
    for (let j: number = 0; j < this.calculationsPerCall; j++) {
      for (let i: number = 0; i < this.arr.length; i++) {
        this.improveSpecificKO(i);
      }
    }
  }
  private improveSpecificKO(index: number): void {
    const origDelta: number = this.calcCompleteDelta();
    let plusDelta: number;
    let minusDelta: number;

    this.arr[index].increaseValue();
    plusDelta = this.calcCompleteDelta();
    this.arr[index].resetValue();

    this.arr[index].decreaseValue();
    minusDelta = this.calcCompleteDelta();
    this.arr[index].resetValue();

    if (plusDelta < origDelta && plusDelta < minusDelta) {
      this.arr[index].increaseValue();
      this.arr[index].increaseSum();
    } else if (minusDelta < origDelta) {
      this.arr[index].decreaseValue();
      this.arr[index].increaseSum();
    } else if (this.arr[index].sumIsHighEnough()) {
      this.arr[index].decreaseSum();
      //this.improveSpecificKO(index);
    } /*else {
      //this.arr[index].resetSum();
      this.arr[index].increaseSum();
    }*/
  }
  public f(x: number): number {
    let sum = 0;
    for (let i: number = 0; i < this.arr.length; i++) {
      sum += this.arr[i].getValue() * x ** i;
    }
    return sum;
  }
  public fToString(): string {
    let arr_str: string[] = [];
    for (let i: number = 0; i < this.arr.length; i++) {
      arr_str.push(Math.round(this.arr[i].getValue()) + "x^" + i);
    }
    arr_str.reverse();
    return arr_str.join(" + ");
  }
  public drawGraph(): void {
    this.color.stroke();
    for (let i = 0; i < width; i++) {
      let x1: number = i * (WIDTH / width);
      let x2: number = (i + 1) * (WIDTH / width);
      let y1: number = this.f(x1) * (height / HEIGHT);
      let y2: number = this.f(x2) * (height / HEIGHT);
      line(i, height - y1, i + 1, height - y2);
    }
  }
  public drawLinearDelta(): void {
    for (let i: number = 0; i < this.training_data.getLength(); i++) {
      let x: number = this.training_data.points[i].x * (width / WIDTH);
      let y1: number = height - this.training_data.points[i].y * (height / HEIGHT);
      let y2: number =
        height - this.f(this.training_data.points[i].x) * (height / HEIGHT);

      stroke(0);
      line(x, y1, x, y2);
    }
  }
  public calcCompleteDelta(expo: number = this.delta_expo): number {
    if(!this.isValid()) {
      return Infinity;
    }
    let n: number = 0;
    for (let i: number = 0; i < this.training_data.getLength(); i++) {
      n += Math.abs(
        this.training_data.points[i].y - this.f(this.training_data.points[i].x)
      ) ** expo;
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
  public isValid(): boolean {
    return this.training_data.getLength() > 0
  }
}

class ExpoRegression {
  private readonly training_data: Plot;
  private readonly grad: number;
  private readonly depthPerFrame: number;
  private readonly framesPerCycle: number;

  private sum: number;

  private newFunktion: Polynom;
  private origFunktion: Polynom;
  constructor(v: number, s: number, data: Plot, grad: number, depth: number) {
    this.training_data = data;
    this.grad = grad;
    this.depthPerFrame = depth;
    this.framesPerCycle = 300;

    this.sum = s;

    this.newFunktion = new Polynom(this.grad, v, Color.default(), Plot.default(), 0);
    this.origFunktion = Polynom.default();
    this.genFunktionen();
  }
  public draw(): void {
    this.newFunktion.drawGraph();
    this.newFunktion.drawLinearDelta();
    this.origFunktion.drawGraph();
    this.origFunktion.drawLinearDelta();
    this.training_data.draw();
  }
  public run(): void {
    if (frameCount % this.framesPerCycle == 0) {
      this.improve();
    }

    this.newFunktion.improve();
  }
  private improve(): void {
    const newDelta: number = this.newFunktion.calcCompleteLinearDelta();
    const origDelta: number = this.origFunktion.calcCompleteLinearDelta();

    if (newDelta < origDelta) {
      this.increaseSum();
      this.origFunktion = this.newFunktion;
      this.origFunktion.color.set(255, 0, 0);
    } else {
      this.decreaseSum();
    }
    this.genFunktionen();
  }
  private increaseSum(): void {
    this.sum *= 1.5;
  }
  private decreaseSum(): void {
    this.sum /= -2;
  }
  private genFunktionen(): void {
    this.newFunktion = new Polynom(
      this.grad,
      this.origFunktion.getExpo() + this.sum,
      new Color(0, 128, 0),
      this.training_data,
      this.depthPerFrame
    );
  }
  public gui(): void {
    noStroke();

    this.origFunktion.color.fill();
    text(`Orig: Expo: ${this.origFunktion.getExpo()}, Delta: ${this.origFunktion.calcCompleteLinearDelta()}`, 10, 15);

    this.newFunktion.color.fill();
    text(`New: Expo: ${this.newFunktion.getExpo()}, Delta: ${this.newFunktion.calcCompleteLinearDelta()}`, 10, 30);
  }
}

const WIDTH: number = 10;
const HEIGHT: number = 100;

let regression: ExpoRegression;

function setup(): void {
  const GRAD: number = 6;
  let plot: Plot = Plot.genRandomPointsFromLength(GRAD + 1);
  regression = new ExpoRegression(2, 1, plot, GRAD, 6000);

  createCanvas(windowWidth, windowHeight);
}
function draw(): void {
  background(220);

  regression.run();
  regression.draw();
  regression.gui();
}

function windowResized(): void {
  resizeCanvas(windowWidth, windowHeight);
}

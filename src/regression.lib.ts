class Color {
    public r: number;
    public g: number;
    public b: number;
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    public set(r: number, g: number, b: number) {
        function adjust(v: number): number {
            if (v <= 0) return 0;
            else if (v >= 255) return 255;
            else return v;
        }
        this.r = adjust(r);
        this.g = adjust(g);
        this.b = adjust(b);
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
    public toHexString(): string {
        return "#" + [this.r, this.g, this.b].map(
            function (value: number): string {
                if (value >= 254.5) return "FF";
                if (value < 0.5) return "00";
                return Math.round(value).toString(16).toUpperCase();
            },
        ).map(
            function (value: string): string {
                if (value.length < 2) return "0" + value;
                return value;
            },
        ).join("");
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
        if (length < 1) return new Plot([]);
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
    public addPoint(p: Point): void {
        this.points.push(p);
    }
}

class Koeffizient {
    private value: number;
    private static readonly default_value: number = 0;
    private sum: number;
    private static readonly default_sum: number = 1;
    private sum_resets: number;
    private origValue: number;
    constructor() {
        this.value = Koeffizient.default_value;
        this.sum = Koeffizient.default_sum;
        this.sum_resets = 0;
        this.origValue = this.value;
    }
    public reset(): void {
        this.value = Koeffizient.default_value;
        this.sum = Koeffizient.default_sum;
        this.sum_resets = 0;
        this.origValue = this.value;
    }
    public resetValue(): void {
        this.value = this.origValue;
    }
    public resetSum(): void {
        this.sum = 2 ** this.sum_resets;
        this.sum_resets++;
    }
    private increaseSum(): void {
        this.sum *= 2;
    }
    public tryDecreaseSum(): boolean {
        if (this.sum / 4 + 1 != 1 && this.sum / 4 > 0) {
            this.sum /= 2;
            return true;
        }
        this.resetSum();
        return false;
    }
    public increaseValue(): void {
        this.value += this.sum;
        this.origValue = this.value;
        this.increaseSum();
    }
    public decreaseValue(): void {
        this.value -= this.sum;
        this.origValue = this.value;
        this.increaseSum();
    }
    public testIncreasedValue(): void {
        this.value += this.sum;
    }
    public testDecreasedValue(): void {
        this.value -= this.sum;
    }
    public getValue(): number {
        return this.value;
    }
}

class Polynom {
    private koeffizienten: Koeffizient[];
    private training_data: Plot;
    private readonly delta_expo: number;
    private orig_delta: number;
    public readonly color: Color;
    private calculationsPerCall: number;
    private add_koeffizient_per_new_point: boolean;
    constructor(
        grad: number,
        expo: number,
        color: Color,
        data: Plot,
        depth: number,
        akpnp: boolean = false
    ) {
        this.training_data = data;
        this.koeffizienten = [];
        for (let i: number = 0; i <= grad; i++) {
            this.koeffizienten.push(new Koeffizient());
        }

        this.delta_expo = expo;
        this.orig_delta = this.calcCompleteDelta();
        this.color = color;
        this.calculationsPerCall = depth;
        this.add_koeffizient_per_new_point = akpnp;
    }
    public static default(): Polynom {
        return new Polynom(5, 2, Color.default(), Plot.default(), 1);
    }
    public improve(): void {
        for (let j: number = 0; j < this.calculationsPerCall; j++) {
            for (let i: number = 0; i < this.koeffizienten.length; i++) {
                this.improveKoeffizient(i, 10);
            }
        }
    }
    private improveKoeffizient(index: number, depth: number = 0): void {
        if (depth < 1) return;
        this.koeffizienten[index].testIncreasedValue();
        let plusDelta: number = this.calcCompleteDelta();
        this.koeffizienten[index].resetValue();

        this.koeffizienten[index].testDecreasedValue();
        let minusDelta: number = this.calcCompleteDelta();
        this.koeffizienten[index].resetValue();

        if (plusDelta < this.orig_delta && plusDelta < minusDelta) {
            this.koeffizienten[index].increaseValue();
            this.orig_delta = plusDelta;
        } else if (minusDelta < this.orig_delta) {
            this.koeffizienten[index].decreaseValue();
            this.orig_delta = minusDelta;
        } else {
            if (this.koeffizienten[index].tryDecreaseSum()) {
                return this.improveKoeffizient(depth - 1);
            } else {
                return;
            }
        }
        this.improveKoeffizient(index, depth);
    }
    public f(x: number): number {
        let sum = 0;
        for (let i: number = 0; i < this.koeffizienten.length; i++) {
            sum += this.koeffizienten[i].getValue() * (x ** i);
        }
        return sum;
    }
    public fToString(): string {
        let arr_str: string[] = [];
        for (let i: number = 0; i < this.koeffizienten.length; i++) {
            arr_str.push(Math.round(this.koeffizienten[i].getValue()) + "x^" + i);
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
            let y1: number = height -
                this.training_data.points[i].y * (height / HEIGHT);
            let y2: number = height -
                this.f(this.training_data.points[i].x) * (height / HEIGHT);

            stroke(0);
            line(x, y1, x, y2);
        }
    }
    public drawPoints(): void {
        this.training_data.draw();
    }
    public calcCompleteDelta(expo: number = this.delta_expo): number {
        if (!this.isValid()) {
            return Infinity;
        }
        let n: number = 0;
        for (let i: number = 0; i < this.training_data.getLength(); i++) {
            n += Math.abs(
                // TODO: cache this
                this.training_data.points[i].y - this.f(this.training_data.points[i].x),
            ) ** expo;
        }
        return n;
    }
    public calcAverageDelta(expo: number = this.delta_expo): number {
        return this.calcCompleteDelta(expo) / this.koeffizienten.length;
    }
    public calcCompleteLinearDelta(): number {
        return this.calcCompleteDelta(1);
    }
    public getGrad(): number {
        return this.koeffizienten.length - 1;
    }
    public getExpo(): number {
        return this.delta_expo;
    }
    public toString(): string {
        return `Grad: ${this.getGrad()}, Delta-Expo: ${this.getExpo()}, Delta: ${this.calcCompleteDelta()}, LinearDelta: ${this.calcCompleteLinearDelta()}`;
    }
    public isValid(): boolean {
        return this.training_data.getLength() > 0;
    }
    public addPoint(p: Point): void {
        this.training_data.addPoint(p);
        if (this.add_koeffizient_per_new_point) {
            this.koeffizienten.push(new Koeffizient());
        }
        this.koeffizientenResetSum();
        this.orig_delta = this.calcCompleteDelta();
    }
    private koeffizientenResetSum(): void {
        for (let i: number = 0; i < this.koeffizienten.length; i++) {
            this.koeffizienten[i].resetSum();
        }
    }
    // @ts-ignore
    private koeffizientenReset(): void {
        for (let i: number = 0; i < this.koeffizienten.length; i++) {
            this.koeffizienten[i].reset();
        }
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

        this.origFunktion = new Polynom(
            this.grad,
            v,
            Color.default(),
            Plot.default(),
            0,
        );
        this.newFunktion = Polynom.default();
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
            this.depthPerFrame,
        );
    }
    public gui(): void {
        noStroke();

        this.origFunktion.color.fill();
        text(
            `Orig: Expo: ${this.origFunktion.getExpo()}, Delta: ${this.origFunktion.calcCompleteLinearDelta()}`,
            10,
            15,
        );

        this.newFunktion.color.fill();
        text(
            `New: Expo: ${this.newFunktion.getExpo()}, Delta: ${this.newFunktion.calcCompleteLinearDelta()}`,
            10,
            30,
        );
    }
}

var WIDTH: number = 10;
var HEIGHT: number = 100;

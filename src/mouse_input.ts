let funktion: Polynom;

var setup = function (): void {
    funktion = new Polynom(-1, 3, Color.default(), Plot.default(), 5000, true);

    createCanvas(windowWidth, windowHeight);
};
var draw = function (): void {
    background(220);

    funktion.drawGraph();
    funktion.drawLinearDelta();
    funktion.drawPoints();
    funktion.improve();
};
var mouseClicked = function (): void {
    let x: number = mouseX / width * WIDTH;
    let y: number = (height - mouseY) / height * HEIGHT;
    let newPoint: Point = new Point(x, y);
    console.log(newPoint);
    funktion.addPoint(newPoint);
};

var windowResized = function (): void {
    resizeCanvas(windowWidth, windowHeight);
};

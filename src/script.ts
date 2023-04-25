var regression: ExpoRegression;

var setup = function(): void {
  const GRAD: number = 6;
  let plot: Plot = Plot.genRandomPointsFromLength(GRAD + 1);
  regression = new ExpoRegression(2, 1, plot, GRAD, 6000);

  createCanvas(windowWidth, windowHeight);
}
var draw = function(): void {
  background(220);

  regression.run();
  regression.draw();
  regression.gui();
}

var windowResized = function(): void {
  resizeCanvas(windowWidth, windowHeight);
}

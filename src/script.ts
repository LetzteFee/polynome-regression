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

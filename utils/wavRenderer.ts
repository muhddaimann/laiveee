export const WavRenderer = {
  drawBars(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    values: Float32Array,
    color: string,
    barWidth: number,
    offset: number,
    spacing: number
  ) {
    const height = canvas.height;
    const bars = Math.min(values.length, Math.floor(canvas.width / (barWidth + spacing)));
    ctx.fillStyle = color;
    for (let i = 0; i < bars; i++) {
      const v = Math.abs(values[i]) * height;
      ctx.fillRect(i * (barWidth + spacing), height - v, barWidth, v);
    }
  },
};

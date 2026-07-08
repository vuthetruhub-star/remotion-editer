import { Resizable, ResizableProps, Control } from "@designcombo/timeline";
import { createResizeControls } from "../controls";

// Class CỐ ĐỊNH, dùng chung mãi mãi cho MỌI motion — không tạo class riêng
// theo từng ý tưởng motion nữa. Đổi ý tưởng chỉ cần sửa nội dung trong
// motion-config.ts + motion-scene.tsx, không đụng file này.
class MotionScene extends Resizable {
  static type = "MotionScene";

  static createControls(): { controls: Record<string, Control> } {
    return { controls: createResizeControls() };
  }

  constructor(props: ResizableProps) {
    super(props);
    this.id = props.id;
    this.display = props.display;
    this.tScale = props.tScale;
    this.fill = "#0a2e12";
    this.rx = 4;
    this.ry = 4;
    this.strokeWidth = 0;
    this.transparentCorners = false;
    this.hasBorders = false;
    this.borderOpacityWhenMoving = 1;
  }

  public _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);
    this.drawLabel(ctx);
    this.updateSelected(ctx);
  }

  private drawLabel(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(-this.width / 2 + 10, -this.height / 2 + 14);
    ctx.font = "500 11px ui-monospace, monospace";
    ctx.fillStyle = "#00FF41";
    ctx.fillText("⬡ MotionScene", 0, 0);
    ctx.restore();
  }

  public updateSelected(ctx: CanvasRenderingContext2D) {
    const borderColor = this.isSelected
      ? "rgba(0,255,65,0.9)"
      : "rgba(0,255,65,0.15)";
    const borderWidth = 2;
    const innerRadius = 4;

    ctx.save();
    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.roundRect(
      -this.width / 2 + borderWidth,
      -this.height / 2 + borderWidth,
      this.width - borderWidth * 2,
      this.height - borderWidth * 2,
      innerRadius
    );
    ctx.fill("evenodd");
    ctx.restore();
  }
}

export default MotionScene;

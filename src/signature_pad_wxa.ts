import SignaturePadBase, { Options } from './signature_pad_base';

export default class SignaturePadWechat extends SignaturePadBase {
  constructor(canvas: WechatMiniprogram.Canvas, options: Options = {}) {
    super(canvas, options);
  }
  public handleTouchStart = (event: WechatMiniprogram.Event): void => {
    if (event.touches.length === 1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore wechatMiniProgram declaration error
      const touch = event.changedTouches[0];
      this.strokeBegin(touch);
    }
  };

  public handleTouchMove = (event: WechatMiniprogram.Event): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore wechatMiniProgram declaration error
    const touch = event.changedTouches[0];
    this.strokeMoveUpdate(touch);
  };

  public handleTouchEnd = (event: WechatMiniprogram.Event): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore wechatMiniProgram declaration error
    const touch = event.changedTouches[0];
    this.strokeEnd(touch);
  };
}

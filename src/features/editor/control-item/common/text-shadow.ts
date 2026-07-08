// Dùng chung giữa text-preset-picker.tsx và caption-preset-picker.tsx —
// convert box-shadow preset (x/y/blur theo đơn vị preset) sang giá trị CSS
// text-shadow (chia 8 vì preset lưu theo đơn vị to hơn màn hình preview).
export interface IBoxShadow {
  color: string;
  x: number;
  y: number;
  blur: number;
}

export const getTextShadow = (boxShadow?: IBoxShadow): string | undefined => {
  if (!boxShadow) return undefined;
  return `${boxShadow.x / 8}px ${boxShadow.y / 8}px ${boxShadow.blur / 8}px ${
    boxShadow.color
  }`;
};

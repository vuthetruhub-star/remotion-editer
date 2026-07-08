import { FC, useEffect, useRef, useState } from "react";
import tinycolor from "tinycolor2";

import ColorPickerPanel from "../color-panel";
import InputRgba from "../color-control";

import { getHexAlpha, useDebounce, checkFormat } from "../utils";

import { IPropsComp, TPropsChange } from "../types";

const ColorPickerSolid: FC<IPropsComp> = ({
  value = "#ffffff",
  onChange = () => ({}),
  format = "rgb",
  debounceMS = 300,
  debounce = true,
  colorBoardHeight = 180
}) => {
  const node = useRef<HTMLDivElement | null>(null);

  const [init, setInit] = useState<boolean>(true);
  const [color, setColor] = useState(getHexAlpha(value));

  const debounceColor = useDebounce(color, debounceMS);

  useEffect(() => {
    if (debounce && debounceColor && init === false) {
      if (value === "transparent" && color.alpha === 0) {
        color.alpha = 100;
      }

      const rgba = tinycolor(color.hex);
      rgba.setAlpha(color.alpha / 100);
      if (tinycolor(rgba).toRgbString() === tinycolor(value).toRgbString()) {
        return;
      }

      onChange(checkFormat(rgba.toRgbString(), format, debounceColor.alpha));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceColor]);

  // Issue https://github.com/undind/react-gcolor-picker/issues/6
  useEffect(() => {
    setColor(getHexAlpha(value));
  }, [value]);

  const onCompleteChange = (value: TPropsChange) => {
    setInit(false);
    setColor({
      hex: value.hex,
      alpha: Math.round(value.alpha)
    });
  };

  // D1A chroma-key color: complement of the brand accent #00FF41 (135° hue)
  // rotated 180° on the HSL wheel → 315° → #FF00BE. Used instead of true
  // alpha so semi-transparent UI (glass fill, glow, shadow) can still be
  // chroma-keyed out cleanly in an external NLE without a true-alpha export.
  const CHROMA_KEY_COLOR = "#FF00BE";

  const onSetTransparent = () => {
    setInit(false);
    setColor({ hex: CHROMA_KEY_COLOR, alpha: 100 });
    onChange(checkFormat(tinycolor(CHROMA_KEY_COLOR).toRgbString(), format, 100));
  };

  const isTransparent = color.hex.toLowerCase() === CHROMA_KEY_COLOR.toLowerCase() && color.alpha === 100;

  return (
    <div ref={node} className="flex flex-col gap-4">
      <ColorPickerPanel
        hex={color.hex}
        alpha={color.alpha}
        colorBoardHeight={colorBoardHeight}
        onChange={onCompleteChange}
      />
      <button
        type="button"
        onClick={onSetTransparent}
        className={[
          "flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
          isTransparent
            ? "border-ring bg-accent text-accent-foreground"
            : "border-border text-muted-foreground hover:text-foreground"
        ].join(" ")}
      >
        <span
          aria-hidden
          className="h-4 w-4 rounded-sm border border-border"
          style={{ background: CHROMA_KEY_COLOR }}
        />
        Transparent (chroma key)
      </button>
      <InputRgba
        hex={color.hex}
        alpha={color.alpha}
        format={format}
        onChange={setColor}
        onSubmitChange={onChange}
      />
    </div>
  );
};

export default ColorPickerSolid;

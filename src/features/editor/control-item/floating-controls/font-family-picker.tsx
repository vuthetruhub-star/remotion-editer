import { useState } from "react";
import useDataState from "../../store/use-data-state";
import { SearchIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import useLayoutStore from "../../store/use-layout-store";
import { ICompactFont } from "../../interfaces/editor";
import { loadFonts } from "../../utils/fonts";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { ITrackItem } from "@designcombo/types";
import FloatingPanel from "./floating-panel";

export const onChangeFontFamily = async (
  font: ICompactFont,
  trackItem: ITrackItem
) => {
  const fontName = font.default.postScriptName;
  const fontUrl = font.default.url;

  await loadFonts([
    {
      name: fontName,
      url: fontUrl
    }
  ]);

  dispatch(EDIT_OBJECT, {
    payload: {
      [trackItem?.id as string]: {
        details: {
          fontFamily: fontName,
          fontUrl: fontUrl
        }
      }
    }
  });
};
export default function FontFamilyPicker() {
  const { compactFonts } = useDataState();
  const [search, setSearch] = useState("");
  const { trackItem } = useLayoutStore();

  const filteredFonts = compactFonts.filter((font) =>
    font.family.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FloatingPanel title="Fonts">
      <div className="flex items-center p-2">
        <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search font..."
          className="w-full rounded-md bg-transparent p-1 text-sm text-muted-foreground outline-none"
        />
      </div>
      <ScrollArea className="h-[400px] w-full py-2">
        {filteredFonts.length > 0 ? (
          filteredFonts.map((font, index) => (
            <div
              key={index}
              onClick={() => {
                if (trackItem) {
                  onChangeFontFamily(font, trackItem);
                }
              }}
              className="cursor-pointer px-2 py-1 hover:bg-zinc-800/50"
            >
              <img
                style={{ filter: "invert(100%)" }}
                src={font.default.preview}
                alt={font.family}
              />
            </div>
          ))
        ) : (
          <p className="py-2 text-center text-sm text-muted-foreground">
            No font found
          </p>
        )}
      </ScrollArea>
    </FloatingPanel>
  );
}

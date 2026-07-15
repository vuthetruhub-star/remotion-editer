#!/usr/bin/env python3
"""
fetch_logo.py — auto-fetch a brand logo from Wikipedia.

Usage:
  python fetch_logo.py "Stripe" "Notion" "Cursor"            # -> ./public/logos/<slug>.png
  python fetch_logo.py --out src/assets/logos "Stripe"        # custom output dir

For each brand:
  1. If `<out>/<slug>.png` already exists, skip (no-op / cache hit).
  2. Otherwise, hit the Wikipedia API, find the article, score every image on the
     page by logo-likelihood, and download the best match to `<slug>.png`.

Slugging rule: lowercase, non-alphanumeric -> underscore. "X (Twitter)" -> `x_twitter`.

No API key needed. Drop the result into the repo's `public/` so a scene can reference
it as a staticFile(). Real logos read as credible; AI illustrations read as stock
(see knowledge/image-style.md).

Wikipedia infobox quirks handled: thumb URLs only allow specific sizes; Wikimedia
upload server needs a browser User-Agent or returns an HTML error page.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional

# Default output dir: ./public/logos under the current working directory (the repo
# root when you run it there). Override with `--out <dir>`.
LOGOS_DIR = Path.cwd() / "public" / "logos"
API_UA = "MotionEditCraft/1.0 (vuthetruhub@gmail.com) Python"
IMG_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36")


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def _api_get(params: dict) -> dict:
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": API_UA})
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def _resolve_image_thumb(filename: str, size: int = 500) -> Optional[str]:
    """Given a Commons filename like 'File:Stripe_logo.svg', resolve to a
    thumbnail URL we can actually download."""
    try:
        data = _api_get({
            "action": "query", "format": "json",
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": str(size),
            "titles": filename,
        })
    except Exception:
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    if not pages:
        return None
    page = next(iter(pages.values()))
    ii = (page.get("imageinfo") or [{}])[0]
    return ii.get("thumburl") or ii.get("url")


def _page_logo_image(title: str) -> Optional[str]:
    """Find the file on a Wikipedia page most likely to be the LOGO. Scores every
    image filename by logo-likelihood, hard-blocks Wikipedia UI chrome."""
    try:
        data = _api_get({
            "action": "query", "format": "json",
            "prop": "images|pageprops", "imlimit": "60",
            "titles": title, "redirects": "1",
        })
    except Exception:
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    if not pages:
        return None
    page = next(iter(pages.values()))
    if str(page.get("pageid", "-1")) == "-1":
        return None
    if "disambiguation" in (page.get("pageprops") or {}):
        return None
    images = page.get("images") or []
    if not images:
        return None
    brand_tokens = set(re.findall(r"[a-z0-9]+", title.lower()))

    def score(filename: str) -> int:
        f = filename.lower().replace(" ", "_")
        s = 0
        if "logo" in f: s += 100
        if "wordmark" in f: s += 80
        if "_mark" in f or " mark" in f or "symbol" in f: s += 40
        if "icon" in f: s += 10
        if f.endswith(".svg"): s += 30
        elif f.endswith(".png"): s += 15
        elif f.endswith((".jpg", ".jpeg")): s -= 30
        for tok in brand_tokens:
            if len(tok) >= 3 and tok in f:
                s += 25
        for bad in ("headquarters", "office", "portrait", "ceo", "founder",
                    "ek_", "field_", "building", "exterior", "interior",
                    "speaking", "conference", "event", "summit", "disrupt"):
            if bad in f: s -= 80
        for chrome in ("commons-logo", "wikidata-logo", "wiki-logo",
                       "wiktionary", "wikipedia-logo", "wikisource",
                       "wikivoyage", "wikibooks", "wikiquote", "wikinews",
                       "question_book", "ambox", "padlock", "nuvola",
                       "p_vip.svg", "wmf_logo", "info_circle",
                       "disambig", "disambiguation", "text_document",
                       "office-book", "edit-find", "speakerlink",
                       "oojs", "ooui", "ui_icon", "ui-icon", "edit-ltr",
                       "magnify-clip", "external_link", "yes_check",
                       "x_mark", "cross_mark", "pd-icon", "pd_icon"):
            if chrome in f: s -= 500
        if re.match(r"^file:symbol_\w+_(class|sub-class)\b", f):
            s -= 500
        return s

    ranked = sorted(images, key=lambda im: -score(im["title"]))
    best = ranked[0]
    if score(best["title"]) < 60:
        return None
    return _resolve_image_thumb(best["title"])


def _pageimages_thumbnail(title: str) -> Optional[str]:
    logo = _page_logo_image(title)
    if logo:
        return logo
    try:
        data = _api_get({
            "action": "query", "format": "json",
            "prop": "pageimages", "piprop": "thumbnail",
            "pithumbsize": "500", "titles": title, "redirects": "1",
        })
    except Exception:
        return None
    pages = (data.get("query") or {}).get("pages") or {}
    if not pages:
        return None
    page = next(iter(pages.values()))
    if str(page.get("pageid", "-1")) == "-1":
        return None
    thumb = (page.get("thumbnail") or {}).get("source")
    if thumb and not thumb.lower().endswith((".jpg", ".jpeg")):
        return thumb
    return None


def wikipedia_pageimage(brand: str) -> Optional[str]:
    """Find the best Wikipedia page for `brand` and return its logo image URL.
    Tries common company disambiguators so plain 'Tesla'/'Bolt' don't hit a person."""
    candidates = [
        brand,
        f"{brand} (company)",
        f"{brand} (software)",
        f"{brand} (service)",
        f"{brand} (application)",
        f"{brand} (chatbot)",
        f"{brand} Inc.",
        f"{brand}, Inc.",
    ]
    for title in candidates:
        thumb = _pageimages_thumbnail(title)
        if thumb:
            return thumb
    params = {
        "action": "query", "format": "json", "list": "search",
        "srsearch": f"{brand} company", "srlimit": "5",
    }
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": API_UA})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read())
    except Exception as e:
        print(f"  [api error] {brand}: {e}", file=sys.stderr)
        return None
    for hit in (data.get("query") or {}).get("search") or []:
        title = hit.get("title", "")
        if any(kw in title.lower() for kw in ("list of", "history of",
                                              "wikipedia", "category:")):
            continue
        thumb = _pageimages_thumbnail(title)
        if thumb:
            return thumb
    return None


def download(url: str, out_path: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": IMG_UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
    except Exception as e:
        print(f"  [dl error] {url}: {e}", file=sys.stderr)
        return False
    if not (data.startswith(b"\x89PNG") or data.startswith(b"\xff\xd8\xff")):
        print(f"  [bad image] {url} returned {len(data)}B non-image content",
              file=sys.stderr)
        return False
    out_path.write_bytes(data)
    return True


def fetch_one(brand: str) -> Optional[str]:
    s = slug(brand)
    out = LOGOS_DIR / f"{s}.png"
    if out.exists() and out.stat().st_size > 0:
        print(f"  [cached] {out}")
        return s
    url = wikipedia_pageimage(brand)
    if not url:
        print(f"  [no-image] no Wikipedia page/infobox for {brand!r}", file=sys.stderr)
        return None
    LOGOS_DIR.mkdir(parents=True, exist_ok=True)
    if not download(url, out):
        return None
    print(f"  [fetched] {out}  {out.stat().st_size}B  ({url})")
    return s


def main() -> int:
    global LOGOS_DIR
    argv = sys.argv[1:]
    if "--out" in argv:
        i = argv.index("--out")
        try:
            LOGOS_DIR = Path(argv[i + 1]).expanduser()
        except IndexError:
            print("--out needs a directory", file=sys.stderr)
            return 2
        del argv[i:i + 2]
    if not argv:
        print("usage: fetch_logo.py [--out DIR] <brand> [<brand> ...]", file=sys.stderr)
        return 2
    failures = 0
    for brand in argv:
        if not fetch_one(brand):
            failures += 1
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())

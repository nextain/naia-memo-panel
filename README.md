# naia-memo-panel

Minimal **installable** naia panel — a local notepad. A reference template for
third-party naia panels (Git URL / Zip / manual install).

Fills the "memo panel" gap left when the built-in `sample-note` demo was removed
from the shell (`// sample-note panel removed — will be replaced by a proper
memo app later`). Unlike `sample-note` (a built-in TSX component), this is a
**static `index.html`** panel rendered in a sandboxed iframe — the format
`~/.naia/panels/{id}/panel.json` loads at runtime.

## Files

```
naia-memo-panel/
├── panel.json     # manifest (id, name, names, icon, iconUrl, version, description)
├── index.html     # self-contained UI (no build step, no external deps)
├── icon.svg       # panel icon
└── README.md
```

## Panel manifest (`panel.json`)

Matches the `PanelManifest` schema (`src-tauri/src/panel.rs`):

| field | required | notes |
|-------|:--------:|-------|
| `id` | yes | panel id; installed under `~/.naia/panels/{id}/` |
| `name` | yes | display name |
| `names` | no | i18n map (`{ "ko": "메모", "en": "Memo" }`) |
| `description` | no | shown in panel list |
| `icon` | no | emoji icon |
| `iconUrl` | no | path to SVG icon (relative) |
| `version` | no | semver |

`index.html` is auto-detected at the panel root and rendered in an iframe.

## Install

> ⚠️ As of 2026-06, the **`panel_install` Git/Zip command is stubbed** in the
> shell (`lib.rs:1287`, "new-core scope out"). The dialog UI exists but the
> backend isn't wired. **Manual install works today** because
> `panel_list_installed` just scans `~/.naia/panels/*/panel.json`. The Git/Zip
> paths below will work once the install RPC is restored from history
> (`git show f4635e8a:agent/src/skills/built-in/panel.ts`).

### 1. Manual copy (works now)

```bash
# Windows
xcopy /E /I . %USERPROFILE%\.naia\panels\memo
# Linux / macOS / Bazzite
cp -r . ~/.naia/panels/memo
```

Then restart naia-os — "📝 메모" appears in the mode bar.

### 2. Git URL (once install RPC is restored)

Publish this folder as a repo (e.g. `github.com/nextain/naia-memo-panel`), then
in naia-os: **패널 추가 → Git URL** →

```
https://github.com/nextain/naia-memo-panel.git
```

### 3. Zip (once install RPC + #359 land)

Zip this folder so that `panel.json` is at the archive root, then
**패널 추가 → 파일 (Zip)**.

## Screenshot tip

The panel seeds three example memos on first run so it is never empty in a
capture. Add `?lang=en` to the iframe URL for the English variant.

## License

Apache-2.0

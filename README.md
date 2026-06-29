# naia-memo-panel

Minimal **installable** naia panel — a local notepad **the AI can read and
write**. A complete reference template for third-party naia panels.

This is the canonical example of an *installable* (iframe) panel that exposes
**AI tools**: declare tools in `panel.json`, handle them in the panel via the
tiny `naia-panel.js` bridge, and Naia can call them while the panel is active.

Fills the "memo panel" gap left when the built-in `sample-note` demo was
removed from the shell. Unlike `sample-note` (a built-in TSX component), this is
a **static `index.html`** panel rendered in a sandboxed iframe — the format
`~/.naia/panels/{id}/panel.json` loads at runtime.

## Files

```
naia-memo-panel/
├── panel.json       # manifest (id, name, icon, tools[], …)
├── index.html       # self-contained UI (no build step, no external deps)
├── naia-panel.js    # copy-paste bridge: routes AI tool calls to your JS
├── icon.svg         # panel icon
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
| `tools` | no | **AI tools** the panel exposes — see below |

`index.html` is auto-detected at the panel root and rendered in an iframe.

## Exposing AI tools (the key pattern)

An installed panel becomes AI-aware in two steps:

**1. Declare the tools in `panel.json`:**

```json
"tools": [
  {
    "name": "skill_memo_read",
    "description": "Read all memos from the Memo panel.",
    "parameters": { "type": "object", "properties": {} },
    "tier": 0
  },
  {
    "name": "skill_memo_write",
    "description": "Add a memo, or clear all memos.",
    "parameters": {
      "type": "object",
      "properties": {
        "text":   { "type": "string" },
        "action": { "type": "string", "enum": ["add", "clear"] }
      },
      "required": ["text"]
    },
    "tier": 1
  }
]
```

- `name` **must** start with `skill_`.
- `tier`: `0` = auto-allow, `1` = notify, `2` = confirm before running.
- These are sent to the Agent as proxy stubs **only while the panel is active**.

**2. Handle the calls in `index.html` via `naia-panel.js`:**

```html
<script src="naia-panel.js"></script>
<script>
  NaiaPanel.onTool("skill_memo_read", () => memos.map(m => m.text).join("\n"));
  NaiaPanel.onTool("skill_memo_write", (args) => {
    memos.unshift({ text: args.text, ts: Date.now() });
    save(); render();
    return "added";
  });
</script>
```

The Shell routes each call to the iframe via `postMessage`; whatever your
handler returns is handed back to the AI as the tool output. That's the entire
contract — copy `naia-panel.js`, register handlers, done.

## Install

The Git URL install is wired as a shell-side Tauri command (`panel_install` —
HTTPS-only `git clone --depth 1` into `~/.naia/panels/`).

### 1. Git URL (from naia-os → 패널 추가)

```
https://github.com/nextain/naia-memo-panel.git
```

### 2. Manual copy

```bash
# Windows
xcopy /E /I . %USERPROFILE%\.naia\panels\naia-memo-panel
# Linux / macOS / Bazzite
cp -r . ~/.naia/panels/naia-memo-panel
```

Then restart naia-os — "📝 메모" appears in the mode bar. Activate it and ask
Naia: *"메모 뭐 있어?"* or *"메모에 '빵 사기' 추가해줘"* — the AI calls
`skill_memo_read` / `skill_memo_write` and the panel updates live.

### 3. Zip (#359 — in preparation)

Zip this folder so `panel.json` is at the archive root, then **패널 추가 → 파일 (Zip)**.

## Screenshot tip

The panel seeds three example memos on first run so it is never empty in a
capture. Add `?lang=en` to the iframe URL for the English variant.

## License

Apache-2.0

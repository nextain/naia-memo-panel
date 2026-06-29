/**
 * naia-panel.js — minimal bridge for installable naia panels.
 *
 * Copy this file into your panel directory and include it from index.html:
 *   <script src="naia-panel.js"></script>
 *
 * Then register handlers for the tools you declared in panel.json:
 *   NaiaPanel.onTool("skill_my_tool", (args) => "result string");
 *
 * Protocol (see GenericInstalledPanel.tsx):
 *   Shell → panel : { type: "naia-tool-call", id, tool, args }
 *   panel → Shell : { type: "naia-tool-result", id, result?, error? }
 *
 * The handler may be sync or async and should return a string (or JSON-able
 * value). Whatever you return is handed back to the AI as the tool output.
 */
(function () {
  const handlers = new Map();

  window.addEventListener("message", async (e) => {
    const d = e.data;
    if (!d || typeof d !== "object" || d.type !== "naia-tool-call") return;

    const fn = handlers.get(d.tool);
    let result;
    let error;
    try {
      if (!fn) throw new Error(`no handler registered for tool "${d.tool}"`);
      result = await fn(d.args || {});
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    // Reply to the loader (parent window) using its own origin.
    const source = e.source;
    if (source && typeof source.postMessage === "function") {
      source.postMessage({ type: "naia-tool-result", id: d.id, result, error }, e.origin);
    }
  });

  /** Push context/a note back to the host (optional, best-effort). */
  function pushContext(type, data) {
    try { window.parent.postMessage({ type: "naia-bridge:pushContext", payload: { type, data } }, "*"); } catch (_) {}
  }

  window.NaiaPanel = {
    /** Register a handler for a tool name. Returns an unregister function. */
    onTool(name, fn) {
      handlers.set(name, fn);
      return () => handlers.delete(name);
    },
    pushContext,
  };
})();

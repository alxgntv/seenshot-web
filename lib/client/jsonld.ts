// @ts-nocheck
// ─── Ariadne's Thread [AT-0572] ─────────────────────
// What: Parse a native application/ld+json script and walk @graph nodes
// Why:  Landing and blog logs must read the same JSON-LD the crawler sees
// Date: 2026-09-05
// Related: [AT-0569] components/JsonLdScript.tsx, [AT-0566] lib/client/releases.ts:faq-jsonld
// ─────────────────────────────────────────────────────
export function readJsonLdScript(id) {
  const node = document.getElementById(id);
  const scriptType = node ? (node.getAttribute("type") || "") : "";
  const raw = node ? (node.textContent || "") : "";
  let parsed = null;
  let parseError = "";
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      parseError = error && error.message ? error.message : String(error);
      console.error("SeenShot site: JSON-LD parse failed id=" + id, error);
    }
  }
  const graph = parsed && Array.isArray(parsed["@graph"])
    ? parsed["@graph"]
    : parsed
      ? [parsed]
      : [];
  console.log(
    "SeenShot site: jsonld id=" + id +
      " found=" + Boolean(node) +
      " scriptType=" + scriptType +
      " chars=" + raw.length +
      " parseError=" + parseError +
      " context=" + (parsed ? parsed["@context"] : "") +
      " type=" + (parsed ? parsed["@type"] : "") +
      " graph=" + graph.length
  );
  graph.forEach(function (entity, index) {
    console.log(
      "SeenShot site: jsonld[" + id + "][" + index + "] type=" + (entity ? entity["@type"] : "") +
        " id=" + (entity ? entity["@id"] : "")
    );
  });
  return {
    node: node,
    scriptType: scriptType,
    raw: raw,
    parsed: parsed,
    graph: graph,
    parseError: parseError,
  };
}

export function jsonLdNodeByType(graph, type) {
  const match = (graph || []).find(function (entity) {
    if (!entity) {
      return false;
    }
    const value = entity["@type"];
    return value === type || (Array.isArray(value) && value.indexOf(type) !== -1);
  });
  console.log(
    "SeenShot site: jsonLdNodeByType type=" + type + " found=" + Boolean(match)
  );
  return match || null;
}

export function jsonLdNodeById(graph, id) {
  const match = (graph || []).find(function (entity) {
    return entity && entity["@id"] === id;
  });
  console.log(
    "SeenShot site: jsonLdNodeById id=" + id + " found=" + Boolean(match)
  );
  return match || null;
}

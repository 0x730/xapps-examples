export function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = String(value || "");
}

export function normalizeLocaleTag(value) {
  const raw = String(value || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
  if (raw === "ro" || raw.startsWith("ro-")) return "ro";
  if (raw === "en" || raw.startsWith("en-")) return "en";
  return "en";
}

export function readOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function parseObjectJson(raw) {
  const text = readOptionalString(raw);
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function importBrowserAssetModule(assetPath) {
  return import(/* @vite-ignore */ assetPath);
}

export function renderPageFailure(input) {
  document.body.textContent = "";
  const main = document.createElement("main");
  main.className = String(input.bodyClassName || "page-shell").trim() || "page-shell";
  const section = document.createElement("section");
  section.className = String(input.sectionClassName || "panel").trim() || "panel";
  const title = document.createElement("h1");
  title.textContent = input.title;
  const message = document.createElement("p");
  message.textContent = input.message;
  section.append(title, message);
  const backHref = String(input.backHref || "").trim();
  if (backHref) {
    const linkWrap = document.createElement("p");
    const link = document.createElement("a");
    link.href = backHref;
    link.textContent = String(input.backLabel || "Return to the launcher").trim();
    linkWrap.append(link);
    section.append(linkWrap);
  }
  main.append(section);
  document.body.append(main);
}

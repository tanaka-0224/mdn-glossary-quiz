import fs from "node:fs";
import path from "node:path";
const root = process.argv[2];
if (!root) throw new Error("Missing glossary directory");
const ja = /[ぁ-んァ-ヶ一-龯]/;
const clean = (s) => s
  .replace(/\{\{Glossary\("([^"]+)"(?:,\s*"([^"]+)")?\)\}\}/g, (_, a, b) => b || a.replaceAll("_", " "))
  .replace(/\{\{(?:jsxref|domxref|httpHeader|cssxref)\("([^"]+)"(?:,\s*"([^"]+)")?[^}]*\)\}\}/g, (_, a, b) => b || a.split("/").pop())
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/\x60([^\x60]+)\x60/g, "$1")
  .replace(/<\/?[^>]+>/g, "")
  .replace(/[*_~]/g, "")
  .replace(/\s+/g, " ").trim();
function parse(s) {
  const m = s.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const fm = m ? m[1] : "";
  const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  const slug = fm.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
  const body = m ? s.slice(m[0].length) : s;
  const para = [];
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) { if (para.length) break; else continue; }
    if (t.startsWith("#") || t.startsWith(String.fromCharCode(96).repeat(3)) || t.startsWith("<!--")) { if (para.length) break; else continue; }
    para.push(t);
  }
  return { title, slug, definition: clean(para.join(" ")) };
}
const entries = [];
for (const d of fs.readdirSync(root, { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const file = path.join(root, d.name, "index.md");
  if (!fs.existsSync(file)) continue;
  const p = parse(fs.readFileSync(file, "utf8"));
  if (!p.title || !p.definition) continue;
  const m = p.title.match(/^(.*?)\s*\(([^()]*)\)\s*$/u);
  const translated = m && ja.test(m[2]);
  entries.push({
    id: d.name,
    term: translated ? m[2].trim() : p.title,
    original: translated ? m[1].trim() : p.title,
    definition: p.definition,
    source: "https://developer.mozilla.org/ja/docs/" + (p.slug || "Glossary/" + d.name)
  });
}
entries.sort((a,b) => a.original.localeCompare(b.original, "en"));
if (entries.length < 100) throw new Error("Incomplete glossary: " + entries.length);
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/glossary.js", "// Generated from MDN translated-content; do not edit manually.\nexport const glossary = " + JSON.stringify(entries, null, 2) + ";\n");
console.log("Generated " + entries.length + " MDN glossary cards.");

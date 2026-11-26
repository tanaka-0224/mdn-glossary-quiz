import fs from "node:fs";
import path from "node:path";

const root = process.argv[2];
if (!root) throw new Error("Missing glossary directory");

const ja = /[ぁ-んァ-ヶ一-龯]/;
const escapeRegExp = (value) => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

function cleanMarkdown(value) {
  return value
    .replace(/\{\{\s*GlossarySidebar\s*\}\}/gi, "")
    .replace(/\{\{\s*glossary\(\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?[^}]*\)\s*\}\}/gi, (_, term, label) => label || term.replaceAll("_", " "))
    .replace(/\{\{\s*(?:jsxref|domxref|httpHeader|cssxref)\(\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?[^}]*\)\s*\}\}/gi, (_, term, label) => label || term.split("/").pop())
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, "")
    .replace(/\x60([^\x60]+)\x60/g, "$1")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const frontMatter = match ? match[1] : "";
  const title = frontMatter.match(/^title:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  const slug = frontMatter.match(/^slug:\s*(.+)$/m)?.[1]?.trim().replace(/^["']|["']$/g, "");
  return { title, slug, body: match ? markdown.slice(match[0].length) : markdown };
}

function firstParagraph(body, term) {
  const paragraphs = body.split(/\r?\n\s*\r?\n/);
  for (const paragraph of paragraphs) {
    const lines = paragraph.split(/\r?\n/).map(line => line.trim());
    const meaningful = lines.filter(line =>
      line &&
      !line.startsWith("#") &&
      !line.startsWith(String.fromCharCode(96).repeat(3)) &&
      !line.startsWith("<!--") &&
      !/^\{\{\s*GlossarySidebar\s*\}\}$/i.test(line)
    );
    if (!meaningful.length) continue;
    const raw = meaningful.join(" ");
    if (/^\{\{\s*[A-Za-z]+\s*\}\}$/.test(raw)) continue;
    const boldTerm = new RegExp("\\*\\*" + escapeRegExp(term) + "\\*\\*((?:（[^）]*）|\\([^)]*\\))?)(?:とは|は)", "g");
    return cleanMarkdown(raw.replace(boldTerm, (_, aside) => "これは" + (aside || "")));
  }
  return "";
}

const entries = [];
for (const dirent of fs.readdirSync(root, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;
  const file = path.join(root, dirent.name, "index.md");
  if (!fs.existsSync(file)) continue;

  const { title, slug, body } = parseFrontMatter(fs.readFileSync(file, "utf8"));
  if (!title) continue;

  const titleMatch = title.match(/^(.*?)\s*\(([^()]*)\)\s*$/u);
  const translated = titleMatch && ja.test(titleMatch[2]);
  const term = translated ? titleMatch[2].trim() : title;
  const original = translated ? titleMatch[1].trim() : title;
  const definition = firstParagraph(body, term);
  if (!definition) continue;

  const leadingTerm = new RegExp("^" + escapeRegExp(term) + "(?=\\s*(?:とは|は|というのは|:|：))");
  const normalizedDefinition = definition.replace(leadingTerm, "").replace(/^[\s、,:：]+/, "");
  if (!normalizedDefinition || /\{\{[^{}]*\}\}/.test(normalizedDefinition)) continue;

  entries.push({
    id: dirent.name,
    term,
    original,
    definition: normalizedDefinition,
    source: "https://developer.mozilla.org/ja/docs/" + (slug || "Glossary/" + dirent.name)
  });
}

entries.sort((a, b) => a.original.localeCompare(b.original, "en"));
if (entries.length < 100) {
  throw new Error("Incomplete glossary: " + entries.length + " entries generated.");
}
if (entries.some(entry => /\{\{[^{}]*\}\}/.test(entry.definition))) {
  throw new Error("Unresolved MDN macro found in generated definitions.");
}

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(
  "data/glossary.js",
  "// Generated from MDN translated-content; do not edit manually.\n" +
  "export const glossary = " + JSON.stringify(entries, null, 2) + ";\n"
);
console.log("Generated " + entries.length + " Japanese MDN glossary cards.");

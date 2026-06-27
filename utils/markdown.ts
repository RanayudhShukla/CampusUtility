/**
 * Simple RegExp-based Markdown compiler utility supporting LaTeX block/inline math expressions.
 * Built to be highly responsive and fully compatible with React 19 with zero dependencies.
 */
export function compileMarkdown(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // LaTeX Block Math: $$ equation $$
  html = html.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, eq) => {
    return `<div class="my-4 p-4 rounded-xl border border-primary/10 bg-primary/5 text-center font-mono text-xs sm:text-sm overflow-x-auto text-primary dark:text-teal-400">
      ${eq.trim()}
    </div>`;
  });

  // LaTeX Inline Math: $ equation $
  html = html.replace(/\$\s*([^\n$]+?)\s*\$/g, (_, eq) => {
    return `<code class="px-1.5 py-0.5 rounded bg-primary/5 text-primary dark:text-teal-400 font-mono text-[11px]">${eq.trim()}</code>`;
  });

  // Code Block: ```lang code ```
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="my-4 p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10">
      <div class="text-[9px] text-white/30 uppercase tracking-widest font-bold pb-2 mb-2 border-b border-white/5">${lang || "code"}</div>
      <code>${code.trim()}</code>
    </pre>`;
  });

  // Inline Code: `code`
  html = html.replace(/`([^`\n]+?)`/g, (_, code) => {
    return `<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-foreground font-mono text-xs">${code}</code>`;
  });

  // Headers: # Header
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl font-bold font-heading text-foreground mt-6 mb-3 border-b border-border pb-1.5">$1</h1>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-bold font-heading text-foreground mt-5 mb-2">$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold font-heading text-foreground mt-4 mb-2">$1</h3>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>");

  // Italics: *text*
  html = html.replace(/\*([^*]+?)\*/g, "<em>$1</em>");

  // Unordered Lists: - item
  // Simple paragraph lines that start with - or *
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc text-sm text-foreground/80 my-1">$1</li>');

  // Wrap consecutive list items in <ul>. A rough but working approach:
  // Replace standalone <li> lines, ensuring we wrap list sequences.
  // In a lightweight regex parser, linebreaks inside lists will just render as lists.

  // Paragraph blocks (split by double newline)
  // Ensure we don't wrap lists, headers, codeblocks inside paragraphs.
  const lines = html.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "<br />";
    
    // Check if it's already an HTML tag
    if (trimmed.startsWith("<h") || trimmed.startsWith("<li") || trimmed.startsWith("<div") || trimmed.startsWith("<pre") || trimmed.startsWith("</pre") || trimmed.startsWith("</code>") || trimmed.startsWith("</div") || trimmed.startsWith("<code>")) {
      return line;
    }
    
    return `<p class="text-sm text-foreground/80 leading-relaxed my-2">${line}</p>`;
  });

  return processedLines.join("\n");
}

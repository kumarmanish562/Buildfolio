import { Portfolio, SecurityAudit, TechStackCategory } from "@/lib/api";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function exportPortfolioHtmlReport(
  portfolio: Portfolio,
  techCategories: TechStackCategory[],
  keyFeatures: string[],
  securityAudit?: SecurityAudit | null
) {
  const techHtml = techCategories
    .map(
      (cat) => `
      <div class="card">
        <h3>${escapeHtml(cat.category)}</h3>
        <div class="tags">
          ${(Array.isArray(cat.items) ? cat.items : [String(cat.items)])
            .map((item) => `<span class="tag">${escapeHtml(item)}</span>`)
            .join("")}
        </div>
      </div>`
    )
    .join("");

  const featuresHtml = keyFeatures
    .map((feat) => `<li>${escapeHtml(feat)}</li>`)
    .join("");

  const mermaidSection = portfolio.mermaidDiagram
    ? `
    <section>
      <h2>System Architecture Diagram</h2>
      <div class="card">
        <pre class="mermaid">${escapeHtml(portfolio.mermaidDiagram)}</pre>
      </div>
    </section>
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
      mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    </script>`
    : "";

  const securitySection = securityAudit
    ? `
    <section>
      <h2>Security Posture & Health Assessment</h2>
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:24px;font-weight:700;color:${
            securityAudit.overallScore >= 80 ? "#10b981" : securityAudit.overallScore >= 60 ? "#f59e0b" : "#ef4444"
          }">
            ${securityAudit.overallScore}/100 Health Score
          </span>
          <span class="tag" style="font-weight:700;">Risk: ${escapeHtml(securityAudit.riskLevel)}</span>
        </div>
        <p><strong>Executive Summary:</strong> ${escapeHtml(securityAudit.summary)}</p>
        <p style="margin-top:10px;"><strong>Key Recommendations:</strong> ${escapeHtml(securityAudit.recommendations)}</p>
      </div>
    </section>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(portfolio.title)} — BuildFolio Report</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 920px;
      margin: 40px auto;
      padding: 0 24px 64px;
      line-height: 1.6;
      color: #18181b;
      background: #fafafa;
    }
    header {
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #be185d; }
    h1 { font-size: 32px; margin: 8px 0 12px; }
    h2 { font-size: 20px; margin: 32px 0 12px; border-bottom: 1px solid #e4e4e7; padding-bottom: 6px; }
    h3 { font-size: 14px; margin: 0 0 10px; color: #52525b; text-transform: uppercase; letter-spacing: 0.04em; }
    .meta { font-size: 13px; color: #71717a; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .card {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      padding: 18px;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag {
      background: #f4f4f5;
      border: 1px solid #e4e4e7;
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 500;
    }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    @media print {
      body { margin: 0; background: #fff; }
    }
  </style>
</head>
<body>
  <header>
    <div class="eyebrow">BuildFolio Engineering Case Study</div>
    <h1>${escapeHtml(portfolio.title)}</h1>
    <div class="meta">Repository: ${escapeHtml(portfolio.repositoryFullName)} • Generated ${new Date().toLocaleDateString()}</div>
    <p>${escapeHtml(portfolio.summary).replace(/\n/g, "<br/>")}</p>
  </header>

  ${
    techCategories.length > 0
      ? `<section><h2>Tech Stack Breakdown</h2><div class="grid">${techHtml}</div></section>`
      : ""
  }

  <section>
    <h2>Architecture Overview</h2>
    <div class="card">${escapeHtml(portfolio.architectureOverview).replace(/\n/g, "<br/>")}</div>
  </section>

  ${mermaidSection}

  ${securitySection}

  ${
    keyFeatures.length > 0
      ? `<section><h2>Key Engineering Highlights</h2><div class="card"><ul>${featuresHtml}</ul></div></section>`
      : ""
  }
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${portfolio.repositoryName}-report.html`;
  link.click();
  URL.revokeObjectURL(url);
}

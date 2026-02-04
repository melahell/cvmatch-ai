export function getCVPrintCSS(format: "A4" | "Letter"): string {
    const size = format === "Letter" ? "Letter" : "A4";

    return `
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

@page {
    margin: 0;
    size: ${size};
}

* {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
}

html, body {
    background: white;
    margin: 0;
    padding: 0;
    overflow: visible !important;
    height: auto !important;
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}

#cv-container, .cv-page {
    width: var(--cv-page-width, 210mm) !important;
    min-height: var(--cv-page-height, 297mm) !important;
    margin: 0 auto;
    overflow: visible !important;
    height: auto !important;
}

.cv-avoid-break,
.break-inside-avoid,
.cv-item,
li {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
}

.page-break-before {
    break-before: page !important;
    page-break-before: always !important;
}

p, li, div {
    orphans: 3;
    widows: 3;
}

h1, h2, h3, h4, h5, h6 {
    break-after: avoid !important;
    page-break-after: avoid !important;
}

[class*="bg-gradient"],
[class*="text-"],
[class*="bg-"],
[class*="border-"],
[style*="background"],
[style*="color"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
}

* {
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
}

@media print {
    a {
        text-decoration: none !important;
        color: inherit !important;
    }
    a[href]::after {
        content: none !important;
    }
}

.print-hidden, .no-print, .print\\:hidden, [data-no-print="true"] {
    display: none !important;
}
`.trim();
}


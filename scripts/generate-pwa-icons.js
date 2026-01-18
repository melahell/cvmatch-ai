#!/usr/bin/env node

/**
 * Script to generate PWA icons from the CV Crush logo
 * Generates 192x192 and 512x512 PNG icons
 */

const fs = require('fs');
const path = require('path');

// SVG template based on LogoStatic component
function generateLogoSVG(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="logoGradientStatic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff4eb3" />
            <stop offset="50%" stop-color="#a855f7" />
            <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
        <filter id="glow-static" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>

    <!-- Background -->
    <rect x="30" y="30" width="140" height="140" rx="35" fill="#1e1b4b" fill-opacity="0.8" />

    <!-- Neon border with glow -->
    <rect
        x="30" y="30" width="140" height="140" rx="35"
        stroke="url(#logoGradientStatic)" stroke-width="8" fill="none"
        filter="url(#glow-static)"
    />

    <!-- Glass reflection -->
    <path
        d="M35 45 Q 100 65 165 45 L 165 100 Q 100 120 35 100 Z"
        fill="url(#logoGradientStatic)"
        fill-opacity="0.1"
    />

    <!-- Inner border reflection -->
    <rect
        x="40" y="40" width="120" height="120" rx="28"
        stroke="white" stroke-width="2" stroke-opacity="0.1" fill="none"
    />

    <!-- Speaker bar -->
    <rect x="85" y="42" width="30" height="4" rx="2" fill="#e2e8f0" fill-opacity="0.5" />

    <!-- Text: CV -->
    <text
        x="100" y="110"
        text-anchor="middle"
        fill="white"
        font-size="58"
        font-weight="900"
        letter-spacing="-3"
        font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    >
        CV
    </text>

    <!-- Text: CRUSH -->
    <text
        x="100" y="140"
        text-anchor="middle"
        fill="#a5b4fc"
        font-size="18"
        font-weight="700"
        letter-spacing="2"
        font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    >
        CRUSH
    </text>
</svg>`;
}

async function generateIcons() {
    console.log('🎨 Génération des icônes PWA CV Crush...\n');

    const iconsDir = path.join(__dirname, '../public/icons');

    // Ensure icons directory exists
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
        console.log('✅ Dossier public/icons/ créé\n');
    }

    const sizes = [192, 512];

    // Generate SVG files
    for (const size of sizes) {
        const svgContent = generateLogoSVG(size);
        const svgPath = path.join(iconsDir, `icon-${size}.svg`);

        fs.writeFileSync(svgPath, svgContent, 'utf8');
        console.log(`✅ SVG généré: icon-${size}.svg (${size}x${size})`);
    }

    console.log('\n📋 Étapes suivantes pour convertir en PNG:');
    console.log('\n1. Avec ImageMagick (recommandé):');
    console.log('   cd public/icons');
    console.log('   convert icon-192.svg icon-192.png');
    console.log('   convert icon-512.svg icon-512.png');

    console.log('\n2. Avec Inkscape:');
    console.log('   inkscape icon-192.svg --export-filename=icon-192.png --export-width=192');
    console.log('   inkscape icon-512.svg --export-filename=icon-512.png --export-width=512');

    console.log('\n3. Avec rsvg-convert:');
    console.log('   rsvg-convert -w 192 -h 192 icon-192.svg -o icon-192.png');
    console.log('   rsvg-convert -w 512 -h 512 icon-512.svg -o icon-512.png');

    console.log('\n4. En ligne (si aucun outil local):');
    console.log('   https://cloudconvert.com/svg-to-png');
    console.log('   https://svgtopng.com/');

    console.log('\n💡 Les fichiers SVG sont prêts dans public/icons/');
    console.log('   Vous pouvez les convertir en PNG avec l\'un des outils ci-dessus.\n');
}

// Check if we can use sharp for direct PNG generation
async function trySharpConversion() {
    try {
        const sharp = require('sharp');
        console.log('📦 Sharp détecté! Conversion directe en PNG...\n');

        const iconsDir = path.join(__dirname, '../public/icons');
        const sizes = [192, 512];

        for (const size of sizes) {
            const svgPath = path.join(iconsDir, `icon-${size}.svg`);
            const pngPath = path.join(iconsDir, `icon-${size}.png`);

            const svgBuffer = fs.readFileSync(svgPath);

            await sharp(svgBuffer)
                .resize(size, size)
                .png({ quality: 100, compressionLevel: 9 })
                .toFile(pngPath);

            console.log(`✅ PNG généré: icon-${size}.png (${size}x${size})`);
        }

        console.log('\n🎉 Icônes PNG générées avec succès!\n');
        return true;
    } catch (error) {
        return false;
    }
}

// Main execution
(async () => {
    try {
        await generateIcons();

        // Try to convert to PNG if sharp is available
        const converted = await trySharpConversion();

        if (!converted) {
            console.log('ℹ️  Sharp non disponible. Les fichiers SVG ont été générés.');
            console.log('   Utilisez l\'une des méthodes ci-dessus pour convertir en PNG.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error.message);
        process.exit(1);
    }
})();

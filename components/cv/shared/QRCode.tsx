"use client";

import React from "react";

export interface QRCodeProps {
    url: string;
    size?: number;
    className?: string;
}

/**
 * QR Code component using Google Charts API
 * Generates a QR code image for the given URL
 */
export default function QRCode({
    url,
    size = 64,
    className = "",
}: QRCodeProps) {
    if (!url) return null;

    // Use Google Charts QR code API (no dependency needed)
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(url)}&choe=UTF-8&chld=L|1`;

    return (
        <div className={`inline-block ${className}`}>
            <img
                src={qrUrl}
                alt="QR Code"
                width={size}
                height={size}
                className="block"
                style={{ imageRendering: "pixelated" }}
            />
        </div>
    );
}

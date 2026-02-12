"use client";

import React from "react";

export interface ProfilePictureProps {
    photoUrl?: string;
    fullName: string;
    initials: string;
    includePhoto?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    shape?: "circle" | "rounded" | "square";
    borderColor?: string;
    className?: string;
}

const SIZE_MAP = {
    sm: { container: "w-16 h-16", text: "text-lg" },
    md: { container: "w-24 h-24", text: "text-2xl" },
    lg: { container: "w-32 h-32", text: "text-3xl" },
    xl: { container: "w-40 h-40", text: "text-4xl" },
};

export default function ProfilePicture({
    photoUrl,
    fullName,
    initials,
    includePhoto = true,
    size = "md",
    shape = "circle",
    borderColor = "#6366f1",
    className = "",
}: ProfilePictureProps) {
    const sizeClasses = SIZE_MAP[size];
    const shapeClass = shape === "circle" ? "rounded-full" : shape === "rounded" ? "rounded-xl" : "rounded-none";

    // Support HTTP URLs AND base64 data URIs
    const hasValidPhoto =
        typeof photoUrl === "string" &&
        (photoUrl.startsWith("http://") || photoUrl.startsWith("https://") || photoUrl.startsWith("data:image/"));

    if (!includePhoto) return null;

    return (
        <div
            className={`${sizeClasses.container} ${shapeClass} border-4 overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
            style={{ borderColor }}
        >
            {hasValidPhoto ? (
                <img
                    src={photoUrl}
                    alt={`Photo de ${fullName}`}
                    className={`w-full h-full object-cover ${shapeClass}`}
                    loading="eager"
                />
            ) : (
                <div
                    className={`w-full h-full ${shapeClass} bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ${sizeClasses.text} font-bold text-white`}
                >
                    {initials}
                </div>
            )}
        </div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';
import { LogoProps } from '../types';

export const CvCrushLogo: React.FC<LogoProps> = ({ 
  width = 100, 
  height = 100, 
  animated = true,
  className = "" 
}) => {
  // --- VARIANTS D'ANIMATION ---

  const phoneOutlineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1, ease: "easeInOut" }
    },
    hover: {
      strokeWidth: 12,
      scale: 1.02,
      filter: "url(#glow-hover)", // Intensifie le néon au survol
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.98,
      strokeWidth: 10,
      transition: { duration: 0.1 }
    }
  };

  const phoneFillVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { delay: 0.5, duration: 0.5 } 
    },
    hover: {
      fillOpacity: 0.3, // Plus lumineux au survol
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const reflectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 0.4, 
      x: 0,
      transition: { delay: 0.8, duration: 0.6 } 
    },
    hover: {
      opacity: 0.6,
      x: 5,
      transition: { duration: 0.3 }
    }
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0, filter: "blur(10px)" },
    visible: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      filter: "blur(0px)",
      transition: { 
        delay: 0.7 + (i * 0.2), 
        duration: 0.6, 
        type: "spring", 
        stiffness: 100 
      }
    }),
    hover: (i: number) => ({
      y: i === 0 ? -4 : 4,
      scale: 1.05,
      textShadow: "0px 0px 8px rgba(236, 72, 153, 0.5)",
      transition: { duration: 0.3 }
    }),
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  const svgVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl cursor-pointer"
        initial={animated ? "hidden" : "visible"}
        animate={animated ? "visible" : "visible"}
        whileHover="hover"
        whileTap="tap"
        variants={svgVariants}
      >
        <defs>
          {/* Gradient Principal Vibrant */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4eb3" />   {/* Rose fluo */}
            <stop offset="50%" stopColor="#a855f7" />  {/* Violet vibrant */}
            <stop offset="100%" stopColor="#6366f1" /> {/* Indigo */}
          </linearGradient>

          {/* Filtre Glow (Néon) */}
          <filter id="glow-base" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Filtre Glow plus intense pour le hover */}
          <filter id="glow-hover" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Fond du téléphone (Format Carré/Squircle) */}
        <motion.rect
          x="30"
          y="30"
          width="140"
          height="140"
          rx="35"
          fill="#1e1b4b" /* Bleu nuit très sombre */
          fillOpacity="0.8"
          stroke="none"
          variants={phoneFillVariants}
        />

        {/* 2. Contour Néon (Format Carré) */}
        <motion.rect
          x="30"
          y="30"
          width="140"
          height="140"
          rx="35"
          stroke="url(#logoGradient)"
          strokeWidth="8"
          fill="none"
          variants={phoneOutlineVariants}
          strokeLinecap="round"
          filter="url(#glow-base)" /* Application du glow */
          style={{ transformOrigin: "center" }}
        />

        {/* 3. Reflet "Glass" (Adapté au format carré) */}
        <motion.path
          d="M35 45 Q 100 65 165 45 L 165 100 Q 100 120 35 100 Z"
          fill="url(#logoGradient)"
          fillOpacity="0.1"
          variants={reflectionVariants}
          style={{ mixBlendMode: 'overlay' }}
        />
        
        {/* Ligne de reflet intérieur fine */}
        <motion.rect
          x="40"
          y="40"
          width="120"
          height="120"
          rx="28"
          stroke="white"
          strokeWidth="2"
          strokeOpacity="0.1"
          fill="none"
        />

        {/* 4. Barre Speaker (Ajustée en hauteur) */}
        <motion.rect
          x="85"
          y="42"
          width="30"
          height="4"
          rx="2"
          fill="#e2e8f0"
          fillOpacity="0.5"
          variants={phoneFillVariants}
        />

        {/* 5. Typographie Modernisée (Centrée verticalement) */}
        <g className="font-sans" style={{ fontFamily: '"Outfit", sans-serif' }}>
          <motion.text
            x="100"
            y="110" 
            textAnchor="middle"
            fill="white"
            fontSize="58"
            fontWeight="900"
            letterSpacing="-3"
            custom={0}
            variants={textVariants}
            style={{ transformOrigin: "center" }}
          >
            CV
          </motion.text>

          <motion.text
            x="100"
            y="140"
            textAnchor="middle"
            fill="#a5b4fc" /* Indigo clair */
            fontSize="18"
            fontWeight="700"
            letterSpacing="2"
            custom={1}
            variants={textVariants}
            style={{ transformOrigin: "center" }}
          >
            CRUSH
          </motion.text>
        </g>
      </motion.svg>
    </div>
  );
};
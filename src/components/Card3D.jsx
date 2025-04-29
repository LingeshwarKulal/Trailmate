import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

export default function Card3D({ 
  children, 
  className = '', 
  depth = 20,
  hoverEffect = true,
  rotateEffect = true,
  glowEffect = true
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!rotateEffect || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePosition({ x: x - 0.5, y: y - 0.5 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `
          perspective(1000px)
          rotateX(${rotateEffect ? mousePosition.y * 20 : 0}deg)
          rotateY(${rotateEffect ? -mousePosition.x * 20 : 0}deg)
          translateZ(${depth}px)
        `
      }}
      whileHover={hoverEffect ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Card Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* 3D Edge Effect */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          transform: 'translateZ(-1px)',
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
        }}
      />

      {/* Glow Effect */}
      {glowEffect && (
        <motion.div
          className="absolute inset-0 -z-20 rounded-lg opacity-50 blur-xl"
          animate={{
            background: `radial-gradient(circle at ${
              (mousePosition.x + 0.5) * 100
            }% ${
              (mousePosition.y + 0.5) * 100
            }%, rgba(255,255,255,0.2), transparent 80%)`
          }}
        />
      )}

      {/* Shadow */}
      <div
        className="absolute inset-0 -z-30"
        style={{
          transform: 'translateZ(-2px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}
      />
    </motion.div>
  );
} 
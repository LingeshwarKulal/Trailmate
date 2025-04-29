import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLocation } from 'react-router-dom';

const Particles = () => {
  const count = 2000;
  const particlesRef = useRef();
  const location = useLocation();

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = Math.random() * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    // Create a gradient effect from green to blue
    colors[i * 3] = 0.2 + Math.random() * 0.2; // R (green component)
    colors[i * 3 + 1] = 0.5 + Math.random() * 0.3; // G (green component)
    colors[i * 3 + 2] = 0.4 + Math.random() * 0.4; // B (blue component)

    sizes[i] = Math.random() * 0.1;
  }

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position.array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      // Add wave motion
      positions[i * 3] += Math.sin(time + i) * 0.01;
      // Falling effect
      positions[i * 3 + 1] -= delta * (0.1 + Math.random() * 0.2);
      // Reset position when particle falls below threshold
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 15;
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the entire particle system slowly
    particlesRef.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

const Mountains = () => {
  const mountainRef = useRef();
  const geometry = new THREE.PlaneGeometry(30, 30, 128, 128);
  const positions = geometry.attributes.position.array;
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 2];
    positions[i + 1] = (Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2) + 
                      (Math.sin(x * 0.25) * Math.cos(z * 0.25) * 4);
  }

  useFrame((state) => {
    if (!mountainRef.current) return;
    mountainRef.current.rotation.x = -Math.PI / 2.5;
    mountainRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    
    // Add subtle wave animation to the mountains
    const positions = mountainRef.current.geometry.attributes.position.array;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = (Math.sin(x * 0.5 + time * 0.2) * Math.cos(z * 0.5) * 2) +
                        (Math.sin(x * 0.25 + time * 0.1) * Math.cos(z * 0.25) * 4);
    }
    mountainRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <mesh ref={mountainRef} position={[0, -5, -5]}>
      <primitive object={geometry} />
      <meshStandardMaterial
        color="#2d3436"
        wireframe
        side={THREE.DoubleSide}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
};

export default function Layout3D({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="relative w-full min-h-screen">
      <div className="fixed inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 75 }}
          style={{
            background: isHome 
              ? 'linear-gradient(to bottom, #134e5e 0%, #71b280 100%)'
              : 'linear-gradient(to bottom, #2d3436 0%, #000000 100%)'
          }}
        >
          <fog attach="fog" args={['#134e5e', 5, 20]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Particles />
          <Mountains />
        </Canvas>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 
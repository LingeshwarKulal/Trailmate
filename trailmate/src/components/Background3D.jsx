import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const Particles = () => {
  const count = 1000;
  const particlesRef = useRef();

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  useFrame((state, delta) => {
    const positions = particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= delta * 0.5; // Fall speed
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 5; // Reset to top when reaching bottom
      }
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
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
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

const Mountains = () => {
  const mountainRef = useRef();
  const planeGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10, 10, 64, 64);
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = Math.sin(x) * Math.cos(z) * 0.5;
    }
    
    return geometry;
  }, []);

  useFrame((state) => {
    mountainRef.current.rotation.x = -Math.PI / 2;
    mountainRef.current.rotation.z = state.clock.elapsedTime * 0.05;
  });

  return (
    <mesh ref={mountainRef} position={[0, -2, 0]}>
      <primitive object={planeGeometry} />
      <meshStandardMaterial
        color="#2d3436"
        wireframe
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const Background3D = () => {
  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, #2d3436 0%, #000000 100%)',
      zIndex: -1
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#2d3436', 5, 15]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 2, 5]} intensity={1} />
        <Particles />
        <Mountains />
      </Canvas>
    </div>
  );
};

export default Background3D;
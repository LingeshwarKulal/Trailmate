import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { random } from 'maath';

// Helper function to check if WebGL is available
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

function FloatingMountain({ position, rotation, scale }) {
  const meshRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.1 + rotation;
    meshRef.current.position.y = Math.sin(time * 0.5) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial
        color="#4a5568"
        wireframe
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function TerrainMesh() {
  const meshRef = useRef();
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 50, 50);
    const vertices = geo.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.sin(vertices[i] * 0.5) * Math.cos(vertices[i + 1] * 0.5) * 0.5;
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i + 2] = Math.sin(vertices[i] * 0.5 + time * 0.2) * Math.cos(vertices[i + 1] * 0.5) * 0.5;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <primitive object={geometry} />
      <meshStandardMaterial
        color="#2d3748"
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

function FloatingParticles({ count = 2000 }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    random.inSphere(positions, { radius: 5 });
    return positions;
  }, [count]);

  const sphere = useMemo(() => new THREE.SphereGeometry(5, 32, 32), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    sphere.attributes.position.array.forEach((_, i) => {
      const i3 = i * 3;
      sphere.attributes.position.array[i3 + 1] += Math.sin(time + i) * 0.001;
    });
    sphere.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Points positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#88ccff"
          size={0.02}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#1a202c']} />
      <fog attach="fog" args={['#1a202c', 5, 20]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <TerrainMesh />
      <FloatingParticles />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Text
          position={[0, 2, 0]}
          fontSize={1}
          color="#14b8a6"
          anchorX="center"
          anchorY="middle"
        >
          TrailMate
        </Text>
      </Float>
      <FloatingMountain position={[-3, 0, -2]} rotation={0.5} scale={1.5} />
      <FloatingMountain position={[3, 0, -3]} rotation={-0.5} scale={2} />
      <FloatingMountain position={[0, 0, -4]} rotation={0} scale={1} />
      <OrbitControls enableZoom={false} />
    </>
  );
}

// Fallback component when WebGL is not available
function Fallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-4xl font-bold text-teal-400 mb-4">TrailMate</h2>
        <p className="text-white mb-6">
          Your ultimate companion for trail planning, gear recommendations, and community insights.
        </p>
        <div className="relative w-full h-32 mb-8">
          <div className="absolute w-20 h-20 bg-teal-500/30 rounded-full top-0 left-1/4 animate-pulse"></div>
          <div className="absolute w-16 h-16 bg-blue-500/30 rounded-full bottom-0 right-1/4 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute w-12 h-12 bg-purple-500/30 rounded-full bottom-4 left-1/3 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <p className="text-yellow-300 text-sm mb-2">
          3D graphics could not be loaded due to WebGL support limitations.
        </p>
        <p className="text-gray-300 text-xs">
          You can still use all the features of TrailMate with a simplified interface.
        </p>
      </div>
    </div>
  );
}

export default function Hero3D() {
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setWebGLSupported(isWebGLAvailable());
  }, []);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute inset-0">
        {webGLSupported ? (
          <ErrorBoundary fallback={<Fallback />}>
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
              <Scene />
            </Canvas>
          </ErrorBoundary>
        ) : (
          <Fallback />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-center bg-gradient-to-t from-slate-900/90 to-transparent">
        <h1 className="text-5xl font-bold text-teal-400 mb-4 tracking-wider">
          Explore Your Adventure
        </h1>
        <p className="text-teal-200/80 text-xl max-w-2xl mx-auto mb-8">
          Discover and plan your perfect trail experience with interactive 3D visualization
        </p>
        <button className="px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
          Start Exploring
        </button>
      </div>
    </div>
  );
}

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("WebGL rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
} 
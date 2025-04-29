import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { motion, AnimatePresence } from 'framer-motion';

export default function TerrainMap({ trekData, onMarkerClick }) {
  const containerRef = useRef(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [controls, setControls] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x87ceeb); // Sky blue background

    // Create camera
    const newCamera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    newCamera.position.set(0, 10, 20);

    // Create renderer
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    newRenderer.shadowMap.enabled = true;
    containerRef.current.appendChild(newRenderer.domElement);

    // Add controls
    const newControls = new OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.05;
    newControls.maxPolarAngle = Math.PI / 2;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    newScene.add(ambientLight);

    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    newScene.add(directionalLight);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);
    setControls(newControls);

    // Cleanup
    return () => {
      newRenderer.dispose();
      containerRef.current?.removeChild(newRenderer.domElement);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!camera || !renderer || !containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [camera, renderer]);

  // Load terrain and add markers
  useEffect(() => {
    if (!scene || !trekData) return;

    const loader = new GLTFLoader();
    
    // Load terrain model
    loader.load(
      '/models/terrain.glb', // You'll need to provide this 3D model
      (gltf) => {
        const terrain = gltf.scene;
        terrain.scale.set(10, 10, 10);
        terrain.receiveShadow = true;
        scene.add(terrain);

        // Add trek route
        if (trekData.coordinates) {
          const routePoints = trekData.coordinates.map(coord => 
            new THREE.Vector3(coord.lng, 0, coord.lat)
          );
          const routeGeometry = new THREE.BufferGeometry().setFromPoints(routePoints);
          const routeMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff00,
            linewidth: 3
          });
          const routeLine = new THREE.Line(routeGeometry, routeMaterial);
          scene.add(routeLine);

          // Animate route drawing
          const points = routeLine.geometry.attributes.position.array;
          let drawCount = 0;
          const animate = () => {
            drawCount = Math.min(drawCount + 3, points.length);
            routeLine.geometry.setDrawRange(0, drawCount);
            if (drawCount < points.length) {
              requestAnimationFrame(animate);
            }
          };
          animate();
        }

        // Add markers
        const addMarker = (position, type) => {
          const markerGeometry = new THREE.SphereGeometry(0.3, 32, 32);
          const markerMaterial = new THREE.MeshPhongMaterial({ 
            color: getMarkerColor(type),
            emissive: getMarkerColor(type),
            emissiveIntensity: 0.5
          });
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.copy(position);
          marker.userData = { type };

          // Add pulse animation
          const pulse = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 32, 32),
            new THREE.MeshBasicMaterial({
              color: getMarkerColor(type),
              transparent: true,
              opacity: 0.3
            })
          );
          pulse.position.copy(position);
          scene.add(pulse);

          // Animate pulse
          const animatePulse = () => {
            pulse.scale.x = 1 + Math.sin(Date.now() * 0.003) * 0.3;
            pulse.scale.y = pulse.scale.x;
            pulse.scale.z = pulse.scale.x;
            requestAnimationFrame(animatePulse);
          };
          animatePulse();

          scene.add(marker);
          return marker;
        };

        // Add different types of markers
        if (trekData.checkpoints) {
          trekData.checkpoints.forEach(checkpoint => {
            addMarker(
              new THREE.Vector3(checkpoint.lng, 0, checkpoint.lat),
              'checkpoint'
            );
          });
        }

        if (trekData.campingZones) {
          trekData.campingZones.forEach(camp => {
            addMarker(
              new THREE.Vector3(camp.lng, 0, camp.lat),
              'camping'
            );
          });
        }

        if (trekData.riskAreas) {
          trekData.riskAreas.forEach(risk => {
            addMarker(
              new THREE.Vector3(risk.lng, 0, risk.lat),
              'risk'
            );
          });
        }

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading terrain:', error);
        setIsLoading(false);
      }
    );
  }, [scene, trekData]);

  // Animation loop
  useEffect(() => {
    if (!scene || !camera || !renderer || !controls) return;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
  }, [scene, camera, renderer, controls]);

  // Helper function to get marker colors
  const getMarkerColor = (type) => {
    switch (type) {
      case 'checkpoint': return 0x4CAF50;
      case 'camping': return 0xFF9800;
      case 'risk': return 0xF44336;
      default: return 0x2196F3;
    }
  };

  // Handle marker click
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    if (onMarkerClick) onMarkerClick(marker);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div className="text-white text-xl">Loading terrain...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          onClick={() => camera?.position.set(0, 10, 20)}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          Reset View
        </button>
      </div>

      {/* Selected marker info */}
      <AnimatePresence>
        {selectedMarker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg text-white"
          >
            <h3 className="text-lg font-bold">{selectedMarker.name}</h3>
            <p>{selectedMarker.description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

const DebrisPoint = ({ position, color, size = 0.05, label }) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Subtle glow */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

const DebrisField = ({ count = 500, selectedId }) => {
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      const radius = 10 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const threatLevel = Math.random();
      const color = threatLevel > 0.8 ? '#FFB800' : '#00F0FF';
      
      p.push({ position: [x, y, z], color, id: `DEB-${i}` });
    }
    return p;
  }, [count]);

  const groupRef = useRef();
  useFrame((state) => {
    groupRef.current.rotation.y += 0.0005;
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => (
        <DebrisPoint 
          key={i} 
          {...p} 
          size={selectedId && i === 0 ? 0.2 : 0.05} 
          color={selectedId && i === 0 ? '#ff0000' : p.color} 
        />
      ))}
    </group>
  );
};

const Earth = () => {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[8, 64, 64]} />
        <meshStandardMaterial 
          color="#050510" 
          emissive="#001020" 
          roughness={0.8}
          metalness={0.2} 
        />
      </mesh>
      {/* Atmosphere Glow */}
      <mesh scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial color="#00F0FF" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* Lat/Long Grid */}
      <gridHelper args={[20, 20, '#ffffff', '#ffffff']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

const JunkGrid = ({ selectedDebris }) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Earth />
        <DebrisField count={500} selectedId={selectedDebris?.id} />
        
        <OrbitControls 
          enablePan={false} 
          minDistance={10} 
          maxDistance={50}
          autoRotate={false}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 z-10 glass glass-cyan p-4 brand-font" style={{pointerEvents: 'none'}}>
        <div style={{fontSize: '0.8rem', opacity: 0.6}}>SCN ORBITAL GRID</div>
        <div style={{fontSize: '1.2rem', color: 'var(--cyan-primary)'}}>LEO SECTOR 7-G</div>
      </div>
    </div>
  );
};

export default JunkGrid;

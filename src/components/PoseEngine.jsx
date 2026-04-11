import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

const TumblingDebris = ({ color = '#00F0FF' }) => {
  const meshRef = useRef();
  
  // Random tumbling rotation
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.3;
    meshRef.current.rotation.z += delta * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef}>
        {/* Complex shape representing debris */}
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial 
          color={color} 
          wireframe={false} 
          metalness={0.9} 
          roughness={0.1} 
          emissive={color}
          emissiveIntensity={0.2}
        />
        {/* Added details for 'complexity' */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[3, 0.2, 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </mesh>
    </Float>
  );
};

const PoseEngine = ({ targetId, status }) => {
  return (
    <div className="w-full h-full bg-slate-950/80 rounded-2xl border border-cyan-500/20 overflow-hidden relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFB800" />
        
        <Stars radius={50} depth={20} count={1000} factor={2} />
        
        <TumblingDebris color={status === 'CYAN' ? '#00F0FF' : '#FFB800'} />
        
        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
      
      {/* UI Overlay for Pose Data */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="glass glass-cyan p-3 rounded-lg border-cyan-500/30">
          <div className="text-[10px] text-cyan-400 brand-font">ROTATIONAL VELOCITY</div>
          <div className="text-sm font-mono text-white">0.42 rad/s</div>
        </div>
        <div className="glass glass-cyan p-3 rounded-lg border-cyan-500/30 text-right">
          <div className="text-[10px] text-cyan-400 brand-font">SURFACE MESH CONFIDENCE</div>
          <div className="text-sm font-mono text-white">94.2%</div>
        </div>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 glass glass-cyan px-4 py-1 rounded-full border-cyan-500/30">
        <div className="text-[8px] text-cyan-400 brand-font text-center">POSE ESTIMATION ACTIVE // {targetId}</div>
      </div>
    </div>
  );
};

export default PoseEngine;

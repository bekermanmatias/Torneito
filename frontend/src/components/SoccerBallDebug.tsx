import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const SoccerBallDebug: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log('🚀 Iniciando SoccerBallDebug...');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: false
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    try {
      mountRef.current.appendChild(renderer.domElement);
    } catch (error) {
      console.error('❌ Error agregando renderer al DOM:', error);
      return;
    }

    // Sistema de iluminación mejorado
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(10, 10, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-8, -5, -3);
    scene.add(fillLight);

    // Cargar modelo GLB
    const loader = new GLTFLoader();
    
    console.log('🔄 Cargando modelo desde: /soccer_ball21.glb');
    
    loader.load(
      "/soccer_ball21.glb",
      (gltf: GLTF) => {
        console.log('✅ Modelo cargado exitosamente');
        setLoading(false);
        
        const model = gltf.scene;
        model.scale.set(5, 5, 5);
        model.position.set(0, 0, 0);
        
        // Analizar el modelo en detalle
        const info = {
          children: model.children.length,
          meshes: 0,
          materials: new Set(),
          geometries: new Set(),
          animations: gltf.animations?.length || 0
        };
        
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            info.meshes++;
            
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  info.materials.add(mat.type);
                  console.log('🔧 Material array:', mat);
                });
              } else {
                info.materials.add(child.material.type);
                console.log('🔧 Material:', child.material);
                
                // Preservar colores originales
                if (child.material.color) {
                  console.log('🎨 Color original:', child.material.color);
                  child.material.color.convertSRGBToLinear();
                }
                
                child.material.needsUpdate = true;
              }
            }
            
            if (child.geometry) {
              info.geometries.add(child.geometry.type);
            }
          }
        });
        
        setModelInfo(info);
        console.log('📊 Información del modelo:', info);
        
        scene.add(model);

        // Animación
        let time = 0;
        const animate = (currentTime: number) => {
          requestAnimationFrame(animate);
          
          time += 0.016;
          model.rotation.y += 0.004;
          model.rotation.x += 0.002;
          model.position.y = Math.sin(time * 0.5) * 0.2;
          
          renderer.render(scene, camera);
        };
        
        animate(0);
      },
      (progress: { loaded: number; total: number }) => {
        const percent = (progress.loaded / progress.total * 100);
        console.log('📥 Cargando:', percent.toFixed(1) + '%');
      },
      (error: unknown) => {
        console.error('❌ Error cargando modelo:', error);
        setError('Error cargando el modelo 3D');
        setLoading(false);
      }
    );

    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando modelo 3D...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50 z-10">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
          </div>
        </div>
      )}
      
      {modelInfo && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg z-10 max-w-xs">
          <h4 className="font-semibold text-gray-800 mb-2">Info del Modelo:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Hijos: {modelInfo.children}</div>
            <div>Mallas: {modelInfo.meshes}</div>
            <div>Materiales: {Array.from(modelInfo.materials).join(', ')}</div>
            <div>Geometrías: {Array.from(modelInfo.geometries).join(', ')}</div>
            <div>Animaciones: {modelInfo.animations}</div>
          </div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default SoccerBallDebug;


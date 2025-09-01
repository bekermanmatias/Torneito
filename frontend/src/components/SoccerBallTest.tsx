import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const SoccerBallTest: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) {
      console.log('❌ mountRef.current es null');
      return;
    }

    console.log('🚀 Iniciando SoccerBallTest...');
    console.log('📏 Dimensiones del contenedor:', mountRef.current.clientWidth, 'x', mountRef.current.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    
    try {
      mountRef.current.appendChild(renderer.domElement);
      console.log('✅ Renderer agregado al DOM');
    } catch (error) {
      console.error('❌ Error agregando renderer al DOM:', error);
      return;
    }

    // Sistema de iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
    mainLight.position.set(15, 15, 10);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-10, -5, -8);
    scene.add(fillLight);

    console.log('💡 Luces configuradas');

    // Cargar modelo GLB
    const loader = new GLTFLoader();
    
    console.log('🔄 Intentando cargar modelo GLB desde: /soccer_ball21.glb');
    
    loader.load(
      "/soccer_ball21.glb",
      (gltf: GLTF) => {
        console.log('✅ Modelo GLB cargado exitosamente');
        console.log('📐 Dimensiones del modelo:', gltf.scene);
        setLoading(false);
        
        const model = gltf.scene;
        model.scale.set(5, 5, 5);
        model.position.set(0, 0, 0);
        
        console.log('🔧 Configurando modelo...');
        
        // Optimizar el modelo
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            
            if (child.material) {
              child.material.envMapIntensity = 1.2;
              child.material.needsUpdate = true;
            }
          }
        });
        
        scene.add(model);
        console.log('✅ Modelo agregado a la escena');

        // Animación
        let time = 0;
        let lastTime = 0;
        
        const animate = (currentTime: number) => {
          requestAnimationFrame(animate);
          
          const deltaTime = currentTime - lastTime;
          if (deltaTime < 16) return;
          lastTime = currentTime;
          
          time += 0.016;
          
          model.rotation.y += 0.004;
          model.rotation.x += 0.002;
          
          model.position.y = Math.sin(time * 0.5) * 0.2;
          
          renderer.render(scene, camera);
        };
        
        console.log('🎬 Iniciando animación...');
        animate(0);
      },
      (progress: { loaded: number; total: number }) => {
        const percent = (progress.loaded / progress.total * 100);
        console.log('📥 Cargando modelo:', percent.toFixed(1) + '%');
      },
      (error: unknown) => {
        console.error('❌ Error cargando el modelo GLB:', error);
        setError('Error cargando el modelo 3D');
        setLoading(false);
        console.log('🔄 Creando balón de respaldo...');
        createFallbackBall();
      }
    );

    const createFallbackBall = () => {
      console.log('🏀 Creando balón de respaldo...');
      
      const geometry = new THREE.SphereGeometry(6, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
      });
      
      const ball = new THREE.Mesh(geometry, material);
      scene.add(ball);

      let time = 0;
      let lastTime = 0;
      
      const animate = (currentTime: number) => {
        requestAnimationFrame(animate);
        
        const deltaTime = currentTime - lastTime;
        if (deltaTime < 16) return;
        lastTime = currentTime;
        
        time += 0.016;
        
        ball.rotation.y += 0.004;
        ball.rotation.x += 0.002;
        
        ball.position.y = Math.sin(time * 0.5) * 0.2;
        
        renderer.render(scene, camera);
      };
      
      console.log('🎬 Iniciando animación del balón de respaldo...');
      animate(0);
    };

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
      console.log('🧹 Limpiando SoccerBallTest...');
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
            <p className="text-sm text-gray-600">Mostrando balón de respaldo</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ 
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default SoccerBallTest;

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const SoccerBall3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) {
      console.log('❌ mountRef.current es null');
      return;
    }

    console.log('🚀 Iniciando SoccerBall3D...');
    console.log('📏 Dimensiones del contenedor:', mountRef.current.clientWidth, 'x', mountRef.current.clientHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 8; // Más cerca para mejor visualización

    const renderer = new THREE.WebGLRenderer({ 
      antialias: false, // Desactivar antialiasing para mejor rendimiento
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
      stencil: false, // Desactivar stencil buffer
      depth: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = false;
    
    // Configuración para colores vibrantes
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    try {
      mountRef.current.appendChild(renderer.domElement);
      console.log('✅ Renderer agregado al DOM');
    } catch (error) {
      console.error('❌ Error agregando renderer al DOM:', error);
      return;
    }

    // Sistema de iluminación mejorado para colores vibrantes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Luz ambiental más intensa
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 10, 5);
    scene.add(mainLight);

    // Luz de relleno para eliminar sombras duras
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-8, -5, -3);
    scene.add(fillLight);

    // Luz puntual para resaltar texturas
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    console.log('💡 Luces configuradas');

    // Cargar modelo GLB
    const loader = new GLTFLoader();
    
    console.log('🔄 Intentando cargar modelo GLB desde: /soccer_ball21.glb');
    
    loader.load(
      "/soccer_ball21.glb",
      (gltf: GLTF) => {
        console.log('✅ Modelo GLB cargado exitosamente');
        console.log('📐 Dimensiones del modelo:', gltf.scene);
        console.log('🔍 Información del modelo:', {
          children: gltf.scene.children.length,
          animations: gltf.animations?.length || 0
        });
        
        const model = gltf.scene;
        model.scale.set(50, 50, 50);
        model.position.set(0, 0, 0);
        
        console.log('🔧 Configurando modelo...');
        
        // Configurar materiales del modelo para mejor visualización
        model.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            // Desactivar sombras para mejor rendimiento
            child.castShadow = false;
            child.receiveShadow = false;
            
            if (child.material) {
              // Preservar colores originales del modelo
              if (child.material.color) {
                child.material.color.convertSRGBToLinear();
              }
              
              // Configurar propiedades del material
              child.material.envMapIntensity = 1.0;
              child.material.needsUpdate = true;
              
              // Asegurar que el material sea visible
              child.material.transparent = false;
              child.material.opacity = 1.0;
              
              // Configurar texturas si existen
              if (child.material.map) {
                child.material.map.colorSpace = THREE.SRGBColorSpace;
                child.material.map.needsUpdate = true;
                console.log('🖼️ Textura base configurada:', child.material.map);
              }
              
              if (child.material.normalMap) {
                child.material.normalMap.colorSpace = THREE.LinearSRGBColorSpace;
                child.material.normalMap.needsUpdate = true;
                console.log('🔄 Textura normal configurada:', child.material.normalMap);
              }
              
              if (child.material.roughnessMap) {
                child.material.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace;
                child.material.roughnessMap.needsUpdate = true;
                console.log('🔍 Textura de rugosidad configurada:', child.material.roughnessMap);
              }
              
              console.log('🔧 Material configurado:', child.material);
              console.log('🎨 Propiedades del material:', {
                hasMap: !!child.material.map,
                hasNormalMap: !!child.material.normalMap,
                hasRoughnessMap: !!child.material.roughnessMap,
                hasMetalnessMap: !!child.material.metalnessMap,
                color: child.material.color,
                roughness: child.material.roughness,
                metalness: child.material.metalness
              });
            }
          }
        });
        
        scene.add(model);
        console.log('✅ Modelo agregado a la escena');

        // Animación optimizada con throttling para mejor rendimiento
        let time = 0;
        let lastTime = 0;
        let frameCount = 0;
        const targetFPS = 30; // Reducir a 30 FPS para mejor rendimiento
        const frameInterval = 1000 / targetFPS;
        
        const animate = (currentTime: number) => {
          requestAnimationFrame(animate);
          
          frameCount++;
          if (frameCount % 2 !== 0) return; // Renderizar cada 2 frames
          
          const deltaTime = currentTime - lastTime;
          if (deltaTime < frameInterval) return;
          lastTime = currentTime;
          
          time += 0.016;
          
          // Rotación simplificada
          model.rotation.y += 0.003;
          model.rotation.x += 0.001;
          
          // Movimiento flotante simplificado
          model.position.y = Math.sin(time * 0.3) * 0.1;
          
          renderer.render(scene, camera);
        };
        
        console.log('🎬 Iniciando animación optimizada...');
        animate(0);
      },
      (progress: { loaded: number; total: number }) => {
        const percent = (progress.loaded / progress.total * 100);
        console.log('📥 Cargando modelo:', percent.toFixed(1) + '%');
      },
      (error: unknown) => {
        console.error('❌ Error cargando el modelo GLB:', error);
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
      console.log('🧹 Limpiando SoccerBall3D...');
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ 
        background: 'transparent'
      }}
    />
  );
};

export default SoccerBall3D;

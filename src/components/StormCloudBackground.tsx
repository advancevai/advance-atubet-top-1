import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LightningBolt {
  points: THREE.Vector3[];
  branches: THREE.Vector3[][];
  life: number;
  maxLife: number;
  alpha: number;
  targetAlpha: number;
  x: number;
  y: number;
}

export const StormCloudBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect software rendering
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2') ||
                   document.createElement('canvas').getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060919, 0.0018);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 1000;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── 1. PROCEDURAL VOLUMETRIC CLOUD TEXTURE ──
    const createCloudTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.Texture();

      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.25, 'rgba(230, 235, 255, 0.65)');
      grad.addColorStop(0.55, 'rgba(150, 175, 255, 0.35)');
      grad.addColorStop(0.8, 'rgba(80, 100, 200, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);

      // Add organic noise speckles
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const dist = Math.hypot(x - 128, y - 128);
        if (dist < 110) {
          const r = Math.random() * 24 + 10;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 110)})`;
          ctx.fill();
        }
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const cloudTexture = createCloudTexture();

    // ── 2. VOLUMETRIC CLOUD PARTICLES ──
    const cloudGeo = new THREE.PlaneGeometry(650, 650);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const cloudParticles: THREE.Mesh[] = [];
    const cloudCount = isSoftwareGl ? 35 : 65;

    for (let p = 0; p < cloudCount; p++) {
      const cloud = new THREE.Mesh(cloudGeo, cloudMaterial.clone());
      cloud.position.set(
        Math.random() * 1400 - 700,
        Math.random() * 800 - 350,
        Math.random() * 700 + 200
      );
      cloud.rotation.z = Math.random() * Math.PI * 2;
      const s = Math.random() * 0.8 + 0.8;
      cloud.scale.set(s, s, 1);
      // Tint with deep navy, violet and midnight cyan
      const isViolet = Math.random() > 0.5;
      if (isViolet) {
        (cloud.material as THREE.MeshLambertMaterial).color.setHSL(0.72 + Math.random() * 0.08, 0.45, 0.16);
      } else {
        (cloud.material as THREE.MeshLambertMaterial).color.setHSL(0.60 + Math.random() * 0.06, 0.55, 0.18);
      }
      scene.add(cloud);
      cloudParticles.push(cloud);
    }

    // ── 3. ATMOSPHERIC LIGHTING RIG ──
    const ambientLight = new THREE.AmbientLight(0x0a1026, 1.2);
    scene.add(ambientLight);

    // Deep blue directional moon/storm light
    const dirLight = new THREE.DirectionalLight(0x224488, 1.5);
    dirLight.position.set(0, 400, 200);
    scene.add(dirLight);

    // Dynamic Lightning Flash Light (Electric Cyan-White)
    const flashLight = new THREE.PointLight(0x64d8ff, 0, 1600, 1.5);
    flashLight.position.set(0, 300, 400);
    scene.add(flashLight);

    // Secondary Violet Flash Light
    const violetFlash = new THREE.PointLight(0x9d4edd, 0, 1400, 1.6);
    violetFlash.position.set(0, 200, 350);
    scene.add(violetFlash);

    // ── 4. ELECTRIC ION PARTICLES ──
    const sparkCount = isSoftwareGl ? 60 : 180;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkColors = new Float32Array(sparkCount * 3);

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = (Math.random() - 0.5) * 1200;
      sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 800;
      sparkPositions[i * 3 + 2] = Math.random() * 700 + 300;

      const isBlue = Math.random() > 0.35;
      if (isBlue) {
        sparkColors[i * 3] = 0.2;
        sparkColors[i * 3 + 1] = 0.8;
        sparkColors[i * 3 + 2] = 1.0;
      } else {
        sparkColors[i * 3] = 0.8;
        sparkColors[i * 3 + 1] = 0.3;
        sparkColors[i * 3 + 2] = 1.0;
      }
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

    const sparkMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const sparkMesh = new THREE.Points(sparkGeo, sparkMat);
    scene.add(sparkMesh);

    // ── 5. PROCEDURAL 3D BRANCHING LIGHTNING ──
    const lightningGroup = new THREE.Group();
    scene.add(lightningGroup);

    const activeBolts: LightningBolt[] = [];

    const generateLightningBranch = (
      start: THREE.Vector3,
      end: THREE.Vector3,
      displacement: number,
      pts: THREE.Vector3[]
    ) => {
      if (displacement < 14) {
        pts.push(start.clone());
        pts.push(end.clone());
        return;
      }

      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);

      // Random jitter orthogonal to bolt direction
      mid.x += (Math.random() - 0.5) * displacement;
      mid.y += (Math.random() - 0.5) * displacement * 0.4;
      mid.z += (Math.random() - 0.5) * displacement * 0.5;

      generateLightningBranch(start, mid, displacement * 0.55, pts);
      generateLightningBranch(mid, end, displacement * 0.55, pts);
    };

    const spawnLightningBolt = () => {
      // Pick random cloud region
      const startX = (Math.random() - 0.5) * 900;
      const startY = 320 + Math.random() * 120;
      const startZ = 450 + Math.random() * 250;

      const endX = startX + (Math.random() - 0.5) * 400;
      const endY = -180 - Math.random() * 220;
      const endZ = startZ + (Math.random() - 0.5) * 200;

      const start = new THREE.Vector3(startX, startY, startZ);
      const end = new THREE.Vector3(endX, endY, endZ);

      const mainPts: THREE.Vector3[] = [];
      generateLightningBranch(start, end, 95, mainPts);

      // Secondary branches
      const branches: THREE.Vector3[][] = [];
      const branchCount = Math.floor(Math.random() * 3) + 2;

      for (let b = 0; b < branchCount; b++) {
        if (mainPts.length > 8) {
          const idx = Math.floor(Math.random() * (mainPts.length - 4)) + 2;
          const branchStart = mainPts[idx].clone();
          const branchEnd = branchStart.clone().add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 240,
              -Math.random() * 180 - 60,
              (Math.random() - 0.5) * 150
            )
          );
          const bPts: THREE.Vector3[] = [];
          generateLightningBranch(branchStart, branchEnd, 45, bPts);
          branches.push(bPts);
        }
      }

      const bolt: LightningBolt = {
        points: mainPts,
        branches,
        life: 0,
        maxLife: Math.random() * 18 + 22, // frames (~350ms)
        alpha: 1,
        targetAlpha: 1,
        x: startX,
        y: startY,
      };

      activeBolts.push(bolt);

      // Light up scene near this bolt
      flashLight.position.set(startX, startY - 100, startZ + 50);
      violetFlash.position.set(startX + 80, startY - 140, startZ + 30);
      flashLight.intensity = Math.random() * 16 + 18;
      violetFlash.intensity = Math.random() * 10 + 12;

      // Pulse nearby clouds
      cloudParticles.forEach((c) => {
        const dist = Math.hypot(c.position.x - startX, c.position.y - startY);
        if (dist < 550) {
          const mat = c.material as THREE.MeshLambertMaterial;
          mat.color.setRGB(0.35, 0.55, 0.95);
        }
      });
    };

    // ── 6. ANIMATION LOOP ──
    let animationFrameId = 0;
    let nextStrikeTimer = 60 + Math.random() * 90; // ~1-2.5 sec first strike

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow cloud rotation & drift with parallax
      if (!prefersReducedMotion) {
        cloudParticles.forEach((p, idx) => {
          p.rotation.z -= delta * (0.015 + (idx % 5) * 0.005);
          p.position.x += Math.sin(elapsed * 0.12 + idx) * 0.15;
          p.position.y += Math.cos(elapsed * 0.15 + idx) * 0.12;

          // Fade clouds back to deep dark atmospheric tones smoothly
          const mat = p.material as THREE.MeshLambertMaterial;
          mat.color.r = THREE.MathUtils.damp(mat.color.r, 0.04, 3.5, delta);
          mat.color.g = THREE.MathUtils.damp(mat.color.g, 0.08, 3.5, delta);
          mat.color.b = THREE.MathUtils.damp(mat.color.b, 0.18, 3.5, delta);
        });

        // Ion spark jitter & slow upward drift
        const positions = sparkGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < sparkCount; i++) {
          positions[i * 3 + 1] += delta * 14;
          if (positions[i * 3 + 1] > 400) {
            positions[i * 3 + 1] = -400;
          }
          positions[i * 3] += Math.sin(elapsed * 2 + i) * 0.35;
        }
        sparkGeo.attributes.position.needsUpdate = true;
      }

      // Smooth decay of lightning illumination
      flashLight.intensity = THREE.MathUtils.damp(flashLight.intensity, 0, 7.5, delta);
      violetFlash.intensity = THREE.MathUtils.damp(violetFlash.intensity, 0, 6.0, delta);

      // Random lightning scheduler (every 2–5 seconds)
      nextStrikeTimer -= 1;
      if (nextStrikeTimer <= 0) {
        spawnLightningBolt();
        // Occasionally trigger a secondary return strike after 120ms
        if (Math.random() > 0.4) {
          setTimeout(() => {
            spawnLightningBolt();
          }, 120 + Math.random() * 80);
        }
        nextStrikeTimer = (Math.random() * 180 + 120); // 2 to 5 seconds at 60fps
      }

      // Rebuild lightning bolt line geometry for active strikes
      while (lightningGroup.children.length > 0) {
        const obj = lightningGroup.children[0] as THREE.Line;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) (obj.material as THREE.Material).dispose();
        lightningGroup.remove(obj);
      }

      // Render active lightning bolts with authentic multi-flicker
      for (let i = activeBolts.length - 1; i >= 0; i--) {
        const bolt = activeBolts[i];
        bolt.life++;

        // Multi-stroke flicker simulation
        const progress = bolt.life / bolt.maxLife;
        let flicker = Math.sin(progress * Math.PI * 4.5);
        if (progress > 0.6) {
          flicker *= (1 - progress) / 0.4;
        }
        bolt.alpha = Math.max(0, Math.min(1, flicker * 1.2));

        if (bolt.life >= bolt.maxLife || bolt.alpha <= 0.01) {
          activeBolts.splice(i, 1);
          continue;
        }

        // Main core line (White-Hot Blue)
        const lineGeo = new THREE.BufferGeometry().setFromPoints(bolt.points);
        const coreMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: bolt.alpha,
          linewidth: 3,
        });
        const mainLine = new THREE.Line(lineGeo, coreMat);
        lightningGroup.add(mainLine);

        // Electric Cyan Glow Line (Slightly wider)
        const glowMat = new THREE.LineBasicMaterial({
          color: 0x00e5ff,
          transparent: true,
          opacity: bolt.alpha * 0.75,
          linewidth: 5,
        });
        const glowLine = new THREE.Line(lineGeo.clone(), glowMat);
        lightningGroup.add(glowLine);

        // Outer Violet Halo
        const haloMat = new THREE.LineBasicMaterial({
          color: 0x8a2be2,
          transparent: true,
          opacity: bolt.alpha * 0.45,
          linewidth: 8,
        });
        const haloLine = new THREE.Line(lineGeo.clone(), haloMat);
        lightningGroup.add(haloLine);

        // Render branches
        bolt.branches.forEach((bPts) => {
          const bGeo = new THREE.BufferGeometry().setFromPoints(bPts);
          const bMat = new THREE.LineBasicMaterial({
            color: 0x64d8ff,
            transparent: true,
            opacity: bolt.alpha * 0.8,
            linewidth: 2,
          });
          lightningGroup.add(new THREE.Line(bGeo, bMat));
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      cloudParticles.forEach((c) => {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      });
      sparkGeo.dispose();
      sparkMat.dispose();
      cloudTexture.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at 50% 25%, #0d1536 0%, #080c1f 45%, #04060f 100%)',
      }}
    />
  );
};

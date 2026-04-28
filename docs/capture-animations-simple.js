#!/usr/bin/env node

/**
 * Script para capturar animaciones HTML y crear GIFs
 * Uso: node capture-animations-simple.js
 * 
 * Este script:
 * 1. Abre cada HTML en navegador
 * 2. Captura frames PNG mientras se animan
 * 3. Las imágenes sirven como frames para crear GIFs con herramientas externas
 */

const fs = require('fs');
const path = require('path');

// Define los archivos HTML a capturar
const animations = [
  {
    name: 'PLATFORM_ANIMATIONS_INTEGRATED',
    file: 'PLATFORM_ANIMATIONS_INTEGRATED.html',
    duration: 12000, // 12 segundos
    fps: 5, // 5 frames por segundo
    description: 'Flujo integrado: Entrada → BD → Cálculos'
  },
  {
    name: 'PLATFORM_ANIMATIONS_ADVANCED',
    file: 'PLATFORM_ANIMATIONS_ADVANCED.html',
    duration: 18000, // 18 segundos
    fps: 4,
    description: 'Animaciones avanzadas con 5 paneles'
  },
  {
    name: 'PLATFORM_ANIMATIONS',
    file: 'PLATFORM_ANIMATIONS.html',
    duration: 15000, // 15 segundos
    fps: 3,
    description: 'Flujo básico del sistema'
  }
];

async function captureAnimation(animConfig) {
  try {
    const puppeteer = require('puppeteer');
    
    console.log(`\n📹 Capturando: ${animConfig.name}`);
    console.log(`   Descripción: ${animConfig.description}`);
    console.log(`   Duración: ${animConfig.duration}ms`);
    console.log(`   FPS: ${animConfig.fps}`);

    // Crear directorio de frames
    const framesDir = path.join(__dirname, `frames_${animConfig.name}`);
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({
      width: 1600,
      height: 1200,
      deviceScaleFactor: 1
    });

    // Abrir HTML
    const htmlPath = `file://${path.join(__dirname, animConfig.file)}`;
    await page.goto(htmlPath, { waitUntil: 'networkidle2', timeout: 30000 });

    // Esperar a que cargue
    await page.waitForTimeout(1000);

    // Calcular intervalo entre frames
    const interval = 1000 / animConfig.fps;
    let frameCount = 0;
    let capturedFrames = 0;

    // Capturar frames
    console.log(`   Capturando frames...`);
    
    for (let time = 0; time < animConfig.duration; time += interval) {
      const screenshot = await page.screenshot();
      const frameFile = path.join(framesDir, `frame-${String(frameCount).padStart(4, '0')}.png`);
      fs.writeFileSync(frameFile, screenshot);
      
      frameCount++;
      capturedFrames++;

      if (frameCount % 10 === 0) {
        process.stdout.write(`\r   Frames capturados: ${frameCount}`);
      }

      await page.waitForTimeout(interval);
    }

    console.log(`\r   ✓ Frames capturados: ${frameCount}\n`);

    // Generar instrucciones para crear GIF
    const gifCommand = generateGifCommand(animConfig.name, frameCount);
    
    console.log(`📝 Próximo paso - Instala ffmpeg y ejecuta:\n`);
    console.log(gifCommand);
    console.log(`\n`);

    // Guardar instrucciones en archivo
    const instructionsFile = path.join(framesDir, 'BUILD_GIF.bat');
    fs.writeFileSync(instructionsFile, gifCommand);

    await browser.close();

    return {
      success: true,
      name: animConfig.name,
      framesDir,
      frameCount,
      gifCommand
    };

  } catch (error) {
    console.error(`❌ Error capturando ${animConfig.name}:`, error.message);
    return {
      success: false,
      name: animConfig.name,
      error: error.message
    };
  }
}

function generateGifCommand(name, frameCount) {
  const framesPath = path.join(__dirname, `frames_${name}`, 'frame-%04d.png');
  const outputGif = path.join(__dirname, `${name}.gif`);
  
  // Comando ffmpeg para crear GIF optimizado
  const ffmpegCmd = `ffmpeg -framerate 5 -i "${framesPath}" -vf "scale=1280:-1:flags=lanczos" -y "${outputGif}"`;
  
  // Comando para Windows (batch)
  return `@echo off\nREM Crear GIF desde frames: ${name}\nREM Requiere ffmpeg instalado\n\nffmpeg -framerate 5 -i "frame-%%%%04d.png" -vf "scale=1280:-1:flags=lanczos" -y "${name}.gif"\n\nif %ERRORLEVEL% EQU 0 (\n  echo ✓ GIF creado exitosamente: ${name}.gif\n) else (\n  echo ✗ Error creando GIF\n)\n\npause`;
}

async function main() {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎬 XAIZA - Capturador de Animaciones HTML a GIF`);
  console.log(`${'='.repeat(70)}`);

  // Verificar que Puppeteer esté disponible
  try {
    require.resolve('puppeteer');
  } catch (e) {
    console.error(`\n❌ Error: Puppeteer no está instalado.`);
    console.error(`\nInstala con: npm install puppeteer`);
    process.exit(1);
  }

  const results = [];

  for (const anim of animations) {
    const result = await captureAnimation(anim);
    results.push(result);
  }

  // Resumen
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 RESUMEN DE CAPTURA`);
  console.log(`${'='.repeat(70)}\n`);

  let successCount = 0;
  for (const result of results) {
    if (result.success) {
      successCount++;
      console.log(`✓ ${result.name}`);
      console.log(`  📁 Frames: ${result.framesDir}`);
      console.log(`  🎞️  Total frames: ${result.frameCount}`);
    } else {
      console.log(`✗ ${result.name}`);
      console.log(`  ❌ Error: ${result.error}`);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`Captura exitosa: ${successCount}/${animations.length}`);
  console.log(`${'='.repeat(70)}\n`);

  console.log(`\n📌 PRÓXIMOS PASOS:\n`);
  console.log(`1. Instala ffmpeg:`);
  console.log(`   Windows (Chocolatey): choco install ffmpeg`);
  console.log(`   Windows (manual): https://ffmpeg.org/download.html\n`);
  
  console.log(`2. En cada carpeta de frames, ejecuta BUILD_GIF.bat\n`);
  
  console.log(`3. También puedes usar comandos manuales:`);
  for (const result of results) {
    if (result.success) {
      console.log(`\n   ${result.name}:`);
      console.log(`   ${result.gifCommand}`);
    }
  }

  console.log(`\n✨ Resultado: Archivos .gif en la misma carpeta de este script\n`);
}

main().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

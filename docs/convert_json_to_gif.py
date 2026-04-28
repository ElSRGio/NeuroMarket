#!/usr/bin/env python3
"""
Conversor de Frames JSON a GIF para NeuroMarket
Uso: python convert_json_to_gif.py archivo.json
"""

import json
import sys
import base64
import os
from pathlib import Path

def json_to_gif(json_file):
    """Convierte un JSON de frames a GIF"""
    
    if not os.path.exists(json_file):
        print(f"❌ Error: No encontré el archivo {json_file}")
        return False
    
    print(f"📂 Leyendo: {json_file}")
    
    try:
        # Leer JSON
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        frames_data = data.get('frames', [])
        fps = data.get('fps', 5)
        anim_name = data.get('animName', 'animation')
        
        if not frames_data:
            print("❌ Error: No hay frames en el JSON")
            return False
        
        print(f"✅ Encontré {len(frames_data)} frames")
        print(f"   FPS: {fps}")
        print(f"   Animación: {anim_name}")
        
        # Extraer imágenes
        print("\n🖼️ Extrayendo imágenes...")
        output_dir = f"frames_{anim_name}"
        os.makedirs(output_dir, exist_ok=True)
        
        for frame in frames_data:
            number = frame.get('number', '0000')
            data_url = frame.get('data', '')
            
            # Remover el prefijo data:image/png;base64,
            if data_url.startswith('data:'):
                data_url = data_url.split(',')[1]
            
            # Decodificar base64
            image_data = base64.b64decode(data_url)
            
            # Guardar PNG
            filename = os.path.join(output_dir, f"frame-{number}.png")
            with open(filename, 'wb') as f:
                f.write(image_data)
            
            if (int(number) + 1) % 10 == 0:
                print(f"  ✓ {number}")
        
        print(f"✅ {len(frames_data)} imágenes extraídas a: {output_dir}/")
        
        # Intentar crear GIF con ffmpeg
        print("\n🎬 Intentando crear GIF con ffmpeg...")
        
        try:
            import subprocess
            
            output_gif = f"{anim_name}_{fps}fps.gif"
            duration = int(100 / fps)  # En centisegundos
            
            cmd = [
                'ffmpeg',
                '-framerate', str(fps),
                '-i', os.path.join(output_dir, 'frame-%04d.png'),
                '-vf', f'scale=trunc(iw/2)*2:trunc(ih/2)*2',  # Asegurar dimensiones pares
                '-y',
                output_gif
            ]
            
            print(f"  Comando: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ GIF creado: {output_gif}")
                return True
            else:
                print(f"⚠️ ffmpeg error: {result.stderr}")
                raise Exception("ffmpeg falló")
                
        except FileNotFoundError:
            print("⚠️ ffmpeg no está instalado")
            print("\n   Instálalo con:")
            print("   • Windows: choco install ffmpeg")
            print("   • Mac: brew install ffmpeg")
            print("   • Linux: sudo apt install ffmpeg")
            print(f"\n   O sube las imágenes de {output_dir}/ a ezgif.com")
            return False
            
    except json.JSONDecodeError as e:
        print(f"❌ Error leyendo JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Uso: python convert_json_to_gif.py archivo.json")
        print("\nEjemplo:")
        print("  python convert_json_to_gif.py Flujo_Integrado_frames_4fps.json")
        sys.exit(1)
    
    success = json_to_gif(sys.argv[1])
    sys.exit(0 if success else 1)

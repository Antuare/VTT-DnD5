import * as PIXI from 'pixi.js';
import gsap from 'gsap';

export interface PixiAppInstance {
  app: PIXI.Application;
  tokenContainer: PIXI.Container;
  gridContainer: PIXI.Container;
}

export function initializePixiApp(container: HTMLElement): PixiAppInstance {
  // Crear aplicación PixiJS
  const app = new PIXI.Application({
    width: container.clientWidth,
    height: container.clientHeight,
    backgroundColor: 0x1a1a2e,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
  });

  // Agregar canvas al contenedor
  container.appendChild(app.view as HTMLCanvasElement);

  // Crear contenedores por capas
  const gridContainer = new PIXI.Container();
  const tokenContainer = new PIXI.Container();

  // Añadir contenedores al stage en orden de capas
  app.stage.addChild(gridContainer);
  app.stage.addChild(tokenContainer);

  // Dibujar grilla inicial
  drawGrid(gridContainer, app.screen.width, app.screen.height);

  // Manejar resize
  const handleResize = () => {
    app.renderer.resize(container.clientWidth, container.clientHeight);
    gridContainer.removeChildren();
    drawGrid(gridContainer, app.screen.width, app.screen.height);
  };

  window.addEventListener('resize', handleResize);

  // Guardar referencia para cleanup
  (app as any)._cleanupResize = handleResize;

  return {
    app,
    tokenContainer,
    gridContainer
  };
}

function drawGrid(container: PIXI.Container, width: number, height: number) {
  const gridSize = 50;
  const gridColor = 0x2a2a4e;
  const gridAlpha = 0.5;

  // Líneas verticales
  for (let x = 0; x <= width; x += gridSize) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, gridColor, gridAlpha);
    line.moveTo(x, 0);
    line.lineTo(x, height);
    container.addChild(line);
  }

  // Líneas horizontales
  for (let y = 0; y <= height; y += gridSize) {
    const line = new PIXI.Graphics();
    line.lineStyle(1, gridColor, gridAlpha);
    line.moveTo(0, y);
    line.lineTo(width, y);
    container.addChild(line);
  }
}

export function destroyPixiApp(instance: PixiAppInstance) {
  // Remover listener de resize
  if ((instance.app as any)._cleanupResize) {
    window.removeEventListener('resize', (instance.app as any)._cleanupResize);
  }

  // Destruir aplicación PixiJS
  instance.app.destroy(true, { children: true, texture: true, baseTexture: true });

  // Remover canvas del DOM
  if (instance.app.view && instance.app.view.parentNode) {
    instance.app.view.parentNode.removeChild(instance.app.view);
  }
}

export function moveToken(
  token: PIXI.Sprite,
  targetX: number,
  targetY: number,
  duration: number = 0.3
): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(token, {
      x: targetX,
      y: targetY,
      duration: duration,
      ease: 'power2.out',
      onComplete: resolve
    });
  });
}

export function createTokenSprite(
  texture: PIXI.Texture,
  x: number,
  y: number,
  size: number = 48
): PIXI.Sprite {
  const sprite = new PIXI.Sprite(texture);
  sprite.width = size;
  sprite.height = size;
  sprite.x = x;
  sprite.y = y;
  sprite.anchor.set(0.5);
  sprite.interactive = true;
  sprite.cursor = 'pointer';

  // Efecto hover
  sprite.on('pointerover', () => {
    gsap.to(sprite.scale, { x: 1.1, y: 1.1, duration: 0.15 });
  });

  sprite.on('pointerout', () => {
    gsap.to(sprite.scale, { x: 1, y: 1, duration: 0.15 });
  });

  return sprite;
}

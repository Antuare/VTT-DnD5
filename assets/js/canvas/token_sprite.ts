import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { createTokenSprite, moveToken } from './engine';

export interface TokenData {
  id: string;
  name: string;
  x: number;
  y: number;
  texture?: string;
}

export class TokenSpriteManager {
  private tokens: Map<string, PIXI.Sprite> = new Map();
  private container: PIXI.Container;
  private app: PIXI.Application;

  constructor(container: PIXI.Container, app: PIXI.Application) {
    this.container = container;
    this.app = app;
  }

  async addToken(tokenData: TokenData): Promise<PIXI.Sprite> {
    // Si ya existe, no añadir duplicado
    if (this.tokens.has(tokenData.id)) {
      return this.tokens.get(tokenData.id)!;
    }

    // Crear textura placeholder si no hay textura
    const texture = tokenData.texture 
      ? await PIXI.Assets.load(tokenData.texture)
      : this.createPlaceholderTexture(tokenData.name);

    const sprite = createTokenSprite(
      texture,
      tokenData.x,
      tokenData.y
    );

    // Añadir eventos de drag
    this.setupDragEvents(sprite, tokenData.id);

    // Añadir al contenedor
    this.container.addChild(sprite);
    this.tokens.set(tokenData.id, sprite);

    // Animación de entrada
    sprite.alpha = 0;
    sprite.scale.set(0);
    gsap.to(sprite, {
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.3,
      ease: 'back.out(1.7)'
    });

    return sprite;
  }

  async updateTokenPosition(tokenId: string, x: number, y: number): Promise<void> {
    const token = this.tokens.get(tokenId);
    if (!token) return;

    await moveToken(token, x, y);
  }

  removeToken(tokenId: string): void {
    const token = this.tokens.get(tokenId);
    if (!token) return;

    // Animación de salida
    gsap.to(token, {
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 0.2,
      onComplete: () => {
        this.container.removeChild(token);
        token.destroy(true);
        this.tokens.delete(tokenId);
      }
    });
  }

  getToken(tokenId: string): PIXI.Sprite | undefined {
    return this.tokens.get(tokenId);
  }

  getAllTokens(): PIXI.Sprite[] {
    return Array.from(this.tokens.values());
  }

  clearAllTokens(): void {
    this.tokens.forEach((token) => {
      this.container.removeChild(token);
      token.destroy(true);
    });
    this.tokens.clear();
  }

  private createPlaceholderTexture(name: string): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    
    // Color basado en el nombre
    const colors = [0xe94560, 0x0f3460, 0x16a085, 0xf39c12, 0x8e44ad];
    const colorIndex = name.length % colors.length;
    const color = colors[colorIndex];

    // Dibujar círculo con borde
    graphics.beginFill(color);
    graphics.lineStyle(3, 0xffffff);
    graphics.drawCircle(24, 24, 22);
    graphics.endFill();

    // Renderizar a textura
    return this.app.renderer.generateTexture(graphics);
  }

  private setupDragEvents(sprite: PIXI.Sprite, tokenId: string): void {
    let isDragging = false;
    let startPos = { x: 0, y: 0 };

    sprite.on('pointerdown', (event) => {
      isDragging = true;
      startPos = { x: event.data.global.x, y: event.data.global.y };
      sprite.alpha = 0.8;
    });

    sprite.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        sprite.alpha = 1;
        
        // Disparar evento de movimiento finalizado
        const gridX = Math.round(sprite.x / 50) * 50;
        const gridY = Math.round(sprite.y / 50) * 50;
        
        if (gridX !== sprite.x || gridY !== sprite.y) {
          // Aquí se podría emitir un evento para Phoenix Channel
          console.log(`Token ${tokenId} moved to grid position:`, gridX, gridY);
        }
      }
    });

    sprite.on('pointerupoutside', () => {
      isDragging = false;
      sprite.alpha = 1;
    });

    sprite.on('pointermove', (event) => {
      if (!isDragging) return;

      const newPos = event.data.global;
      sprite.x = newPos.x;
      sprite.y = newPos.y;
    });
  }
}

export default TokenSpriteManager;

import { GameEntity } from './game-entity.model';

export class Player extends GameEntity {
  color: string = '#3498db'; // Blue color for player
  health: number = 100; // Player health
  maxHealth: number = 100;
  xp: number = 0; // Player experience points
  maxXp: number = 100;
  image: any; // Imagem do player
  facingRight: boolean = false; // Por padrão, o sprite olha para a esquerda

  constructor(x: number, y: number, size: number) {
    super(x, y, size * 1.5, size * 2.5); // Increased size for the player
  }

  update(p5: any): void {
    if (p5.keyIsDown(87)) this.y -= 3; // W key
    if (p5.keyIsDown(83)) this.y += 3; // S key

    // Ao pressionar "a" (key code 65): move para a esquerda e força sprite a olhar para a esquerda
    if (p5.keyIsDown(65)) {
      this.x -= 3;
      this.facingRight = false;
    }
    // Ao pressionar "d" (key code 68): move para a direita e força sprite a olhar para a direita
    if (p5.keyIsDown(68)) {
      this.x += 3;
      this.facingRight = true;
    }

    // Keep player within canvas bounds
    this.x = p5.constrain(this.x, 0, p5.width - this.width);
    this.y = p5.constrain(this.y, 0, p5.height - this.height);
  }

  display(p5: any): void {
    // Exibe o asset survivor.png para o player com escala aumentada
    if (!this.image) {
      this.image = p5.loadImage('app/assets/survivor.png');
    }
    p5.push();
    p5.imageMode(p5.CENTER);
    const scaleFactor = 2; // Fator de escala para aumentar a proporção do asset
    // Centraliza a imagem
    p5.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Se o estado estiver como facingRight, inverte horizontalmente
    if (this.facingRight) {
      p5.scale(-1, 1);
    }
    
    p5.image(this.image, 0, 0, this.width * scaleFactor, this.height * scaleFactor);
    p5.pop();

    // Display health bar
    const healthBarWidth = this.width * 2; // Wider health bar
    const healthBarX = this.x + this.width / 2 - healthBarWidth / 2; // Centered above the player
    const healthBarY = this.y - 30; // Positioned above the player

    // Background of the health bar
    p5.fill('#555');
    p5.rect(healthBarX, healthBarY, healthBarWidth, 10);

    // Foreground of the health bar
    p5.fill('#2ecc71');
    p5.rect(healthBarX, healthBarY, (this.health / this.maxHealth) * healthBarWidth, 10);

    // XP bar
    p5.fill('#f39c12');
    p5.rect(this.x, this.y - 10, (this.xp / this.maxXp) * this.width, 5);
  }
}
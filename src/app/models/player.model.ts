import { GameEntity } from './game-entity.model';

export class Player extends GameEntity {
  color: string = '#3498db'; // Blue color for player
  health: number = 100; // Player health
  maxHealth: number = 100;
  xp: number = 0; // Player experience points
  maxXp: number = 100;

  constructor(x: number, y: number, size: number) {
    super(x, y, size * 1.5, size * 2.5); // Increased size for the player
  }

  update(p5: any): void {
    // Handle player movement with W, A, S, D keys
    if (p5.keyIsDown(87)) this.y -= 2; // W key (keyCode 87) - Move up
    if (p5.keyIsDown(83)) this.y += 2; // S key (keyCode 83) - Move down
    if (p5.keyIsDown(65)) this.x -= 2; // A key (keyCode 65) - Move left
    if (p5.keyIsDown(68)) this.x += 2; // D key (keyCode 68) - Move right

    // Keep player within canvas bounds
    this.x = p5.constrain(this.x, 0, p5.width - this.width);
    this.y = p5.constrain(this.y, 0, p5.height - this.height);
  }

  display(p5: any): void {
    // Draw player as a person
    p5.push();

    // Head
    p5.fill('#f1c40f'); // Yellow for the head
    p5.ellipse(this.x + this.width / 2, this.y, this.width, this.width); // Larger head

    // Body
    p5.fill(this.color); // Blue for the body
    p5.rect(this.x + this.width / 4, this.y + this.width / 2, this.width / 2, this.height); // Larger body

    // Arms
    p5.stroke(this.color);
    p5.strokeWeight(6); // Thicker arms
    p5.line(this.x, this.y + this.height / 4, this.x + this.width / 4, this.y + this.height / 2); // Left arm
    p5.line(this.x + this.width, this.y + this.height / 4, this.x + this.width * 0.75, this.y + this.height / 2); // Right arm

    // Legs
    p5.line(this.x + this.width / 4, this.y + this.height, this.x + this.width / 4, this.y + this.height * 1.5); // Left leg
    p5.line(this.x + this.width * 0.75, this.y + this.height, this.x + this.width * 0.75, this.y + this.height * 1.5); // Right leg

    p5.pop();

    // Display health bar
    const healthBarWidth = this.width * 2; // Wider health bar
    const healthBarX = this.x + this.width / 2 - healthBarWidth / 2; // Centered above the player
    const healthBarY = this.y - 30; // Higher position for the health bar

    // Background of the health bar
    p5.fill('#555'); // Dark gray background
    p5.rect(healthBarX, healthBarY, healthBarWidth, 10);

    // Foreground of the health bar
    p5.fill('#2ecc71'); // Green for health
    p5.rect(healthBarX, healthBarY, (this.health / this.maxHealth) * healthBarWidth, 10);

    // Text for the health bar
    p5.fill(255); // White text
    p5.textSize(14); // Larger text
    p5.textAlign(p5.CENTER, p5.BOTTOM);
    p5.text('Barra de Vida', healthBarX + healthBarWidth / 2, healthBarY - 2);

    // Display XP bar
    p5.fill('#f39c12'); // Orange for XP
    p5.rect(this.x, this.y - 10, (this.xp / this.maxXp) * this.width, 5);
  }
}
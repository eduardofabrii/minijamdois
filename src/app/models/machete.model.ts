import { GameEntity } from './game-entity.model';
import { Player } from './player.model';

export class Machete extends GameEntity {
  angle: number = 0;
  radius: number = 100; // Distance from player
  rotationSpeed: number = 0.05; // Rotation speed
  player: Player;

  constructor(player: Player, size: number) {
    super(player.x, player.y, size * 2, size * 3); // Larger size for the axe
    this.player = player;
  }

  update(p5: any): void {
    // Update angle for orbit movement
    this.angle += this.rotationSpeed;

    // Calculate position based on orbit
    this.x = this.player.x + this.player.width / 2 - this.width / 2 + 
             Math.cos(this.angle) * this.radius;
    this.y = this.player.y + this.player.height / 2 - this.height / 2 + 
             Math.sin(this.angle) * this.radius;
  }

  display(p5: any): void {
    // Display machete as an axe
    p5.push();
    p5.translate(this.x + this.width / 2, this.y + this.height / 2);
    p5.rotate(this.angle); // Rotate the axe to match its orbit

    // Handle of the axe
    p5.fill('#8B4513'); // Brown color for the handle
    p5.rect(-this.width / 6, -this.height / 2, this.width / 3, this.height);

    // Blade of the axe
    p5.fill('#C0C0C0'); // Silver color for the blade
    p5.triangle(
      -this.width / 2, -this.height / 2, // Top-left corner of the blade
      this.width / 2, -this.height / 2,  // Top-right corner of the blade
      0, this.height / 3                // Bottom point of the blade
    );

    p5.pop();
  }
}
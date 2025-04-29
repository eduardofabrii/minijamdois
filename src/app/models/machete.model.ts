import { GameEntity } from './game-entity.model';
import { Player } from './player.model';

export class Machete extends GameEntity {
  angle: number = 0;
  radius: number = 60; // Distance from player
  rotationSpeed: number = 0.05; // Rotation speed
  player: Player;
  color: string = '#e74c3c'; // Red color for machete

  constructor(player: Player, size: number) {
    super(player.x, player.y, size, size);
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
    p5.fill(this.color);
    p5.noStroke();
    p5.rect(this.x, this.y, this.width, this.height);
  }
}
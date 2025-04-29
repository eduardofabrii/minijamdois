import { GameEntity } from './game-entity.model';
import { Player } from './player.model';

export class Monster extends GameEntity {
  speed: number = 0.8;
  player: Player;
  isAlive: boolean = true;

  constructor(x: number, y: number, width: number, height: number, player: Player) {
    super(x, y, width, height);
    this.player = player;
  }

  update(p5: any): void {
    if (!this.isAlive) return;

    // Calculate direction toward player
    const dx = this.player.x + this.player.width / 2 - (this.x + this.width / 2);
    const dy = this.player.y + this.player.height / 2 - (this.y + this.height / 2);
    
    // Normalize direction
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Move toward player
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }
  }

  display(p5: any): void {
    if (!this.isAlive) return;

    // Display zombie with darker colors
    p5.noStroke();
    p5.fill('#1abc9c'); // Dark green for zombies
    p5.rect(this.x, this.y, this.width, this.height);
  }
}
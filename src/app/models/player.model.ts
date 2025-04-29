import { GameEntity } from './game-entity.model';

export class Player extends GameEntity {
  color: string = '#3498db'; // Blue color for player

  constructor(x: number, y: number, size: number) {
    super(x, y, size, size);
  }

  update(p5: any): void {
    // Player is stationary at center, no update needed
  }

  display(p5: any): void {
    p5.fill(this.color);
    p5.noStroke();
    p5.rect(this.x, this.y, this.width, this.height);
  }
}
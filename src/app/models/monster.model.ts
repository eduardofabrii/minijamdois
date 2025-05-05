import { GameEntity } from './game-entity.model';
import { Player } from './player.model';

export class Monster extends GameEntity {
  speed: number = 0.8;
  player: Player;
  isAlive: boolean = true;
  private biteTimer: number = 0; // Temporizador para controlar o dano

  constructor(x: number, y: number, width: number, height: number, player: Player) {
    super(x, y, width, height);
    this.player = player;
  }

  update(p5: any): void {
    if (!this.isAlive) return;

    // Calcular direção em direção ao jogador
    const dx = this.player.x + this.player.width / 2 - (this.x + this.width / 2);
    const dy = this.player.y + this.player.height / 2 - (this.y + this.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0 && distance > this.width / 2) {
      // Mover em direção ao jogador
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    } else {
      // Monstro está próximo o suficiente para atacar
      this.biteTimer += p5.deltaTime; // Incrementar o temporizador

      if (this.biteTimer >= 500) { // 0.5 segundos (500ms)
        this.player.health -= 10; // Reduzir a vida do jogador
        this.biteTimer = 0; // Reiniciar o temporizador
      }
    }
  }

  display(p5: any): void {
    if (!this.isAlive) return;

    // Exibir zumbi com cores escuras
    p5.noStroke();
    p5.fill('#1abc9c'); // Verde escuro para zumbis
    p5.rect(this.x, this.y, this.width, this.height);
  }
}
import { GameEntity } from './game-entity.model';
import { Player } from './player.model';

export class Machete extends GameEntity {
  angle: number = 0;
  radius: number = 100; // Distância do player
  rotationSpeed: number = 0.05; // Velocidade de rotação
  player: Player;
  image: any; // Imagem do machado
  scaleFactor: number = 2.5; // Fator de escala

  constructor(player: Player, size: number) {
    // Inicialmente, a largura e altura base são calculadas sem escala
    super(player.x, player.y, size * 2, size * 3);
    // Atualiza as dimensões (hitbox) aplicando o fator de escala
    this.width = this.width * this.scaleFactor;
    this.height = this.height * this.scaleFactor;
    this.player = player;
  }

  update(p5: any): void {
    this.angle += this.rotationSpeed;
    // Calcula a nova posição considerando a largura já escalada
    this.x = this.player.x + this.player.width / 2 - this.width / 2 +
             Math.cos(this.angle) * this.radius;
    this.y = this.player.y + this.player.height / 2 - this.height / 2 +
             Math.sin(this.angle) * this.radius;
  }

  display(p5: any): void {
    if (!this.image) {
      this.image = p5.loadImage('app/assets/machado.png');
    }
    p5.push();
    p5.translate(this.x + this.width / 2, this.y + this.height / 2);
    p5.rotate(this.angle);
    p5.imageMode(p5.CENTER);
    // Agora desenha usando as dimensões já escaladas
    p5.image(this.image, 0, 0, this.width, this.height);
    p5.pop();
  }
}
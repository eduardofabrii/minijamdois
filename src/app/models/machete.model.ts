import { GameEntity } from "./game-entity.model";
import { Player } from "./player.model";

export class Machete extends GameEntity {
  angle: number = 0;
  radius: number = 200; // A mesma distância que usamos na lógica de addMachete
  rotationSpeed: number = 0.05; // Velocidade de rotação
  player: Player;
  image: any; // Imagem do machado
  scaleFactor: number = 2.5; // Fator de escala

  constructor(player: Player, size: number) {
    // Inicialmente, a largura e altura são calculadas sem escala
    super(player.x, player.y, size * 2, size * 3);
    // Atualiza as dimensões aplicando o fator de escala
    this.width = this.width * this.scaleFactor;
    this.height = this.height * this.scaleFactor;
    this.player = player;
  }

  update(p5: any): void {
    // Se um offsetAngle foi definido, incrementa-o para fazer a órbita funcionar
    if ((this as any).offsetAngle !== undefined) {
      (this as any).offsetAngle += this.rotationSpeed;
      const a = (this as any).offsetAngle;
      this.x =
        this.player.x +
        this.player.width / 2 -
        this.width / 2 +
        Math.cos(a) * this.radius;
      this.y =
        this.player.y +
        this.player.height / 2 -
        this.height / 2 +
        Math.sin(a) * this.radius;
    } else {
      // Caso contrário, usa a lógica padrão (rotacionando a propriedade angle)
      this.angle += this.rotationSpeed;
      this.x =
        this.player.x +
        this.player.width / 2 -
        this.width / 2 +
        Math.cos(this.angle) * this.radius;
      this.y =
        this.player.y +
        this.player.height / 2 -
        this.height / 2 +
        Math.sin(this.angle) * this.radius;
    }
  }

  display(p5: any): void {
    if (!this.image) {
      this.image = p5.loadImage("app/assets/machado.png");
    }
    // Usa o mesmo ângulo efetivo para a rotação da imagem
    const effectiveAngle = (this as any).offsetAngle !== undefined ? (this as any).offsetAngle : this.angle;
    p5.push();
    p5.translate(this.x + this.width / 2, this.y + this.height / 2);
    p5.rotate(effectiveAngle);
    p5.imageMode(p5.CENTER);
    p5.image(this.image, 0, 0, this.width, this.height);
    p5.pop();
  }
}

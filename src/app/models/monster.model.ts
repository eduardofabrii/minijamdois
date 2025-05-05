import { GameEntity } from './game-entity.model';
import { Player } from './player.model';

export class Monster extends GameEntity {
  speed: number = 0.8;
  player: Player;
  isAlive: boolean = true;
  private biteTimer: number = 0; // Temporizador para controlar o dano
  image: any; // Imagem do zumbi
  // Cada bloco do rastro agora possui posição, velocidade vertical, lifetime (em ms) e targetY
  bloodTrail: { x: number; y: number; vy: number; lifetime: number; targetY: number }[] = [];
  // Armazena o tempo (ms) da última adição de bloco
  private lastBloodTime: number = 0;

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
      this.biteTimer += p5.deltaTime;
      if (this.biteTimer >= 250) { // 0.25 segundos (250ms)
        this.player.health -= 10;
        this.biteTimer = 0;
      }
    }

    // Ao adicionar um novo bloco, definimos targetY como a posição atual + um deslocamento pequeno
    if (p5.millis() - this.lastBloodTime > 300) {
      this.bloodTrail.push({ 
        x: this.x + this.width / 2 + p5.random(-3, 3),
        y: this.y + this.height / 2,
        vy: 0,
        lifetime: 2000, // tempo de vida de 2000ms
        targetY: (this.y + this.height / 2) + p5.random(5, 15) // cai só um pouco
      });
      this.lastBloodTime = p5.millis();
    }

    // Atualiza a posição e lifetime de cada bloco (simulando uma queda curta)
    for (let i = this.bloodTrail.length - 1; i >= 0; i--) {
      const block = this.bloodTrail[i];
      block.lifetime -= p5.deltaTime;
      // Remove o bloco se seu lifetime acabou
      if (block.lifetime <= 0) {
        this.bloodTrail.splice(i, 1);
        continue;
      }
      // Faz o bloco "cair" até atingir seu targetY
      if (block.y < block.targetY) {
        block.vy += 0.5; // gravidade simulada
        block.y += block.vy;
        if (block.y > block.targetY) {
          block.y = block.targetY;
          block.vy = 0;
        }
      }
    }

    // Limita o rastro a no máximo 5 blocos
    if (this.bloodTrail.length > 5) {
      this.bloodTrail.splice(0, this.bloodTrail.length - 5);
    }
  }

  display(p5: any): void {
    if (!this.isAlive) return;
  
    // Desenha o rastro de sangue com blocos "caídos" no chão
    p5.push();
    p5.noStroke();
    p5.fill('#8B0000'); // Cor vermelho escuro
    for (let block of this.bloodTrail) {
      p5.rect(block.x, block.y, 5, 5);
    }
    p5.pop();
    
    // Carrega o asset zumbi.png se ainda não estiver carregado
    if (!this.image) {
      this.image = p5.loadImage('app/assets/zumbi.png');
    }
    
    p5.push();
    p5.imageMode(p5.CENTER);
    const scaleFactor = 5; // Fator de escala para aumentar o tamanho do monstro
    
    // Centraliza a imagem
    p5.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Calcula a diferença entre os centros do player e do monstro
    const dx = (this.player.x + this.player.width / 2) - (this.x + this.width / 2);
    
    // Se o player estiver à direita do monstro, espelha horizontalmente o sprite
    if (dx > 0) {
      p5.scale(-1, 1);
    }
    
    p5.image(this.image, 0, 0, this.width * scaleFactor, this.height * scaleFactor);
    p5.pop();
  }
}
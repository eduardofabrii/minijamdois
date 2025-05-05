import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Player } from "../models/player.model";
import { Machete } from "../models/machete.model";
import { Monster } from "../models/monster.model";

@Injectable({
  providedIn: "root",
})
export class GameService {
  private readonly GAME_DURATION = Infinity; // jogo infinito

  private gameTimeSubject = new BehaviorSubject<number>(this.GAME_DURATION);
  gameTime$ = this.gameTimeSubject.asObservable();

  private isGameOverSubject = new BehaviorSubject<boolean>(false);
  isGameOver$ = this.isGameOverSubject.asObservable();

  private scoreSubject = new BehaviorSubject<number>(0);
  score$ = this.scoreSubject.asObservable();

  player!: Player;
  machetes: Machete[] = []; // Array for multiple machetes
  monsters: Monster[] = [];

  private canvasWidth = 0;
  private canvasHeight = 0;
  private lastMonsterSpawnTime = 0;
  private monsterSpawnInterval = 1500; // Spawn monsters every 1.5 seconds
  private wave = 1; // Track the current wave
  private lastWaveUpdate = 0; // Tempo do último update de wave

  initGame(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Reset game state
    this.gameTimeSubject.next(this.GAME_DURATION);
    this.isGameOverSubject.next(false);
    this.scoreSubject.next(0);
    this.monsters = [];
    this.wave = 1;
    this.monsterSpawnInterval = 1500;
    this.lastWaveUpdate = 0;

    // Create player in the center
    const playerSize = 20;
    this.player = new Player(
      canvasWidth / 2 - playerSize / 2,
      canvasHeight / 2 - playerSize / 2,
      playerSize
    );

    // Initialize machetes array with a single machete
    const macheteSize = 10;
    this.machetes = [new Machete(this.player, macheteSize)];

    // Spawn initial monsters (exemplo: 10 zumbis)
    const initialMonsterCount = 10;
    for (let i = 0; i < initialMonsterCount; i++) {
      const monsterWidth = 10;
      const monsterHeight = 14;
      let x, y;
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: // Top
          x = Math.random() * (this.canvasWidth - monsterWidth);
          y = -monsterHeight;
          break;
        case 1: // Right
          x = this.canvasWidth;
          y = Math.random() * (this.canvasHeight - monsterHeight);
          break;
        case 2: // Bottom
          x = Math.random() * (this.canvasWidth - monsterWidth);
          y = this.canvasHeight;
          break;
        default: // Left
          x = -monsterWidth;
          y = Math.random() * (this.canvasHeight - monsterHeight);
          break;
      }
      const monster = new Monster(
        x,
        y,
        monsterWidth,
        monsterHeight,
        this.player
      );
      this.monsters.push(monster);
    }
  }

  updateGame(p5: any): void {
    if (this.isGameOverSubject.value) return;

    // Update player movement
    this.player.update(p5);

    // Atualiza o game timer (exibe tempo decorrido, se necessário)
    if (p5.frameCount % 60 === 0) {
      const elapsedTime = p5.millis() / 1000;
      this.gameTimeSubject.next(elapsedTime);
    }

    // Spawn monsters periodicamente (por exemplo, a cada X milissegundos)
    const currentTime = p5.millis();
    if (currentTime - this.lastMonsterSpawnTime > this.monsterSpawnInterval) {
      this.spawnMonster(p5);
      this.lastMonsterSpawnTime = currentTime;
    }

    // A cada 30 segundos, inicia uma nova wave com quantidade multiplicada de zumbis:
    if (currentTime - this.lastWaveUpdate >= 30000) {
      this.wave++; // Incrementa a wave
      this.lastWaveUpdate = currentTime;

      // Calcula a quantidade de zumbis para a wave atual:
      const extraMonsters = 30 * Math.pow(2, this.wave - 1);
      for (let i = 0; i < extraMonsters; i++) {
        this.spawnMonster(p5);
      }
      // Opcional: Você pode também ajustar outras propriedades, como diminuir o intervalo de spawn ou aumentar a velocidade dos monstros.
    }

    // Atualiza todas as machetes
    this.machetes.forEach((machete) => machete.update(p5));

    // Atualiza cada monstro e verifica colisões
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i];
      if (monster.isAlive) {
        monster.update(p5);

        // Verifica colisão com quaisquer machetes
        for (const machete of this.machetes) {
          if (machete.isColliding(monster)) {
            monster.isAlive = false;
            this.scoreSubject.next(this.scoreSubject.value + 1);
            this.monsters.splice(i, 1);
            break;
          }
        }

        // Verifica colisão com o player
        if (monster.isColliding(this.player)) {
          if (this.player.health <= 0) {
            this.endGame();
          }
        }
      }
    }
  }

  addMachete(): void {
    const macheteRadius = 200; // distância desejada do player
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    const numVertices = 5;
    const angleStep = (2 * Math.PI) / numVertices;

    // Se já existem 5 machetes, não adiciona mais
    if (this.machetes.length >= numVertices) {
      return;
    }

    // Use o número atual de machetes como índice para o vértice do pentágono
    const index = this.machetes.length;
    const angle = index * angleStep;

    const newMachete = new Machete(this.player, 10);
    // Armazena o ângulo fixo que define a posição relativa ao player
    (newMachete as any).offsetAngle = angle;

    // Ajusta a posição inicial (opcional, pois o update usará offsetAngle)
    newMachete.x =
      centerX + macheteRadius * Math.cos(angle) - newMachete.width / 2;
    newMachete.y =
      centerY + macheteRadius * Math.sin(angle) - newMachete.height / 2;

    this.machetes.push(newMachete);
  }

  private spawnMonster(p5: any): void {
    if (this.monsters.length >= 50) return;

    const monsterWidth = 10;
    const monsterHeight = 14;
    let x, y;
    const side = Math.floor(p5.random(4));
    switch (side) {
      case 0: // Top
        x = p5.random(this.canvasWidth - monsterWidth);
        y = -monsterHeight;
        break;
      case 1: // Right
        x = this.canvasWidth;
        y = p5.random(this.canvasHeight - monsterHeight);
        break;
      case 2: // Bottom
        x = p5.random(this.canvasWidth - monsterWidth);
        y = this.canvasHeight;
        break;
      default: // Left
        x = -monsterWidth;
        y = p5.random(this.canvasHeight - monsterHeight);
        break;
    }
    const monster = new Monster(x, y, monsterWidth, monsterHeight, this.player);
    this.monsters.push(monster);
  }

  private endGame(): void {
    this.isGameOverSubject.next(true);
  }

  resetGame(): void {
    if (this.canvasWidth && this.canvasHeight) {
      this.initGame(this.canvasWidth, this.canvasHeight);
    }
  }
}

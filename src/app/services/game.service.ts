import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';
import { Machete } from '../models/machete.model';
import { Monster } from '../models/monster.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly GAME_DURATION = 120; // 120 seconds
  
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
  }
  
  updateGame(p5: any): void {
    if (this.isGameOverSubject.value) return;

    // Update player movement
    this.player.update(p5); // Ensure the player's update method is called
    
    // Update game timer
    if (p5.frameCount % 60 === 0) { // Roughly every second
      const currentTime = this.gameTimeSubject.value - 1;
      this.gameTimeSubject.next(currentTime);
      
      if (currentTime <= 0) {
        this.endGame();
      }
    }
    
    // Spawn monsters
    const currentTime = p5.millis();
    if (currentTime - this.lastMonsterSpawnTime > this.monsterSpawnInterval) {
      this.spawnMonster(p5);
      this.lastMonsterSpawnTime = currentTime;
    }
    
    // Increase difficulty every 30 seconds
    if (p5.frameCount % (60 * 30) === 0) {
      this.wave++;
      this.monsterSpawnInterval = Math.max(500, this.monsterSpawnInterval - 100); // Faster spawns
      this.monsters.forEach(monster => monster.speed += 0.2); // Faster zombies
    }
    
    // Update all machetes
    this.machetes.forEach(machete => machete.update(p5));
    
    // Update monsters and check collisions
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i];
      
      if (monster.isAlive) {
        monster.update(p5);
        
        // Check collision with any machete
        for (const machete of this.machetes) {
          if (machete.isColliding(monster)) {
            monster.isAlive = false;
            this.scoreSubject.next(this.scoreSubject.value + 1);
            this.monsters.splice(i, 1); // Remove dead monster
            break;
          }
        }
        
        // Check collision with player
        if (monster.isColliding(this.player)) {
          this.monsters.forEach(monster => {
            monster.update(p5);
        
            // Verificar se o jogador morreu
            if (this.player.health <= 0) {
              this.endGame();
            }
          });
        }
      }
    }
  }
  
  addMachete(): void {
    const macheteRadius = 50; // Raio do pentágono
    const centerX = this.canvasWidth / 2; // Centro fixo do canvas
    const centerY = this.canvasHeight / 2;
    const numVertices = 5; // Número de vértices do pentágono
    const angleStep = (2 * Math.PI) / numVertices; // Ângulo entre os vértices
    const minDistance = 30; // Distância mínima entre machetes

    // Limita o número de machetes a 5
    if (this.machetes.length >= 5) {
      return;
    }

    // Calcula as posições do pentágono
    const positions = [];
    for (let i = 0; i < numVertices; i++) {
      const angle = i * angleStep;
      const x = centerX + macheteRadius * Math.cos(angle);
      const y = centerY + macheteRadius * Math.sin(angle);
      positions.push({ x, y });
    }

    // Verifica se já existe uma machete próxima antes de adicionar
    for (const pos of positions) {
      const isOverlapping = this.machetes.some(
        machete => Math.hypot(machete.x - pos.x, machete.y - pos.y) < minDistance
      );

      if (!isOverlapping) {
        const newMachete = new Machete(this.player, 10); // Cria a machete com base no jogador
        newMachete.x = pos.x; // Ajusta a posição x
        newMachete.y = pos.y; // Ajusta a posição y
        this.machetes.push(newMachete);
        break; // Adiciona apenas uma machete por chamada
      }
    }
  }
  
  private spawnMonster(p5: any): void {
    if (this.monsters.length >= 50) return; // Limit max monsters
    
    const monsterWidth = 10;
    const monsterHeight = 14; // Slightly taller for two pixels
    let x, y;
    
    // Randomly choose a side to spawn from
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
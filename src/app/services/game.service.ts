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
  machete!: Machete;
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
    
    // Create machete
    const macheteSize = 10;
    this.machete = new Machete(this.player, macheteSize);
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
    
    // Update machete
    this.machete.update(p5);
    
    // Update monsters and check collisions
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const monster = this.monsters[i];
      
      if (monster.isAlive) {
        monster.update(p5);
        
        // Check collision with machete
        if (this.machete.isColliding(monster)) {
          monster.isAlive = false;
          this.scoreSubject.next(this.scoreSubject.value + 1);
          this.monsters.splice(i, 1); // Remove dead monster
        }
        
        // Check collision with player
        if (monster.isColliding(this.player)) {
          this.player.health -= 10; // Reduce player health
          if (this.player.health <= 0) {
            this.endGame();
          }
        }
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
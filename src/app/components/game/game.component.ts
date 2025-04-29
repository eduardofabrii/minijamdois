import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import p5 from 'p5';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;
  
  private p5Instance: any;
  gameTime = 120;
  score = 0;
  isGameOver = false;
  
  private subscriptions: Subscription[] = [];
  
  constructor(private gameService: GameService) {}
  
  ngOnInit(): void {
    // Subscribe to game state
    this.subscriptions.push(
      this.gameService.gameTime$.subscribe(time => this.gameTime = time),
      this.gameService.isGameOver$.subscribe(isGameOver => this.isGameOver = isGameOver),
      this.gameService.score$.subscribe(score => this.score = score)
    );
    
    // Create p5 instance
    this.createCanvas();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Remove p5 instance
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  }
  
  private createCanvas(): void {
    const sketch = (p: any) => {
      p.setup = () => {
        // Create canvas and initialize game
        const canvas = p.createCanvas(500, 500);
        canvas.parent(this.gameContainer.nativeElement);
        
        this.gameService.initGame(p.width, p.height);
      };
      
      p.draw = () => {
        // Clear background
        p.background(20); // Dark background
        
        // Update game state
        this.gameService.updateGame(p);
        
        // Display player
        this.gameService.player.display(p);
        
        // Display machete
        this.gameService.machete.display(p);
        
        // Display monsters
        for (const monster of this.gameService.monsters) {
          monster.display(p);
        }
        
        // Display game info
        this.displayGameInfo(p);
      };
    };
    
    this.p5Instance = new p5(sketch);
  }
  
  private displayGameInfo(p: any): void {
    // Display score and time
    p.fill(255);
    p.textSize(16);
    p.textAlign(p.LEFT, p.TOP);
    p.text(`Time: ${this.gameTime}s`, 10, 10);
    p.text(`Score: ${this.score}`, 10, 30);
  }
  
  restartGame(): void {
    this.gameService.resetGame();
  }
}
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
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
  showGif: boolean = true; // Controla a exibição do GIF
  showTutorial: boolean = false; // Controla a exibição do tutorial
  showStory: boolean = false; // Controla a exibição da história
  
  // Tutorial steps
  currentTutorialStep = 1;
  totalTutorialSteps = 3;
  
  // Story steps
  currentStoryStep = 1;
  totalStorySteps = 5;
  
  private subscriptions: Subscription[] = [];
  
  constructor(private gameService: GameService) {}
  
  ngOnInit(): void {
    // Subscribe to game state
    this.subscriptions.push(
      this.gameService.gameTime$.subscribe(time => this.gameTime = time),
      this.gameService.isGameOver$.subscribe(isGameOver => this.isGameOver = isGameOver),
      this.gameService.score$.subscribe(score => this.score = score)
    );
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
      let lastMacheteAddedTime = 0; // Tempo da última machete adicionada

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight); // Fullscreen canvas
        canvas.parent(this.gameContainer.nativeElement);

        this.gameService.initGame(p.width, p.height);
        lastMacheteAddedTime = p.millis(); // Inicializa o tempo da última machete
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight); // Adjust canvas on window resize
        this.gameService.initGame(p.width, p.height);
      };

      p.draw = () => {
        p.clear();

        // Update game state
        this.gameService.updateGame(p);

        // Display player
        this.gameService.player.display(p);

        // Display monsters
        for (const monster of this.gameService.monsters) {
          monster.display(p);
        }

        // Exibir a pontuação no canto superior direito
        p.fill(255); // Cor do texto (branco)
        p.textSize(24); // Tamanho da fonte
        p.textAlign(p.RIGHT, p.TOP); // Alinhar à direita e ao topo
        p.text(`Zumbis derrotados: ${this.score}`, p.width - 10, 10); // Exibir no canto superior direito

        // Adiciona uma nova machete a cada 45 segundos
        if (p.millis() - lastMacheteAddedTime >= 45000) {
          this.gameService.addMachete();
          lastMacheteAddedTime = p.millis(); // Atualiza o tempo da última machete
        }

        // Exibe todas as machetes
        this.gameService.machetes.forEach(machete => machete.display(p));
      };
    };

    this.p5Instance = new p5(sketch);
  }

  @HostListener('document:click')
  @HostListener('document:keydown')
  handleUserInteraction(): void {
    if (this.showGif) {
      this.showGif = false;
      this.showTutorial = true; // Mostrar o tutorial depois do GIF
    } else if (this.showTutorial) {
      // Se já está mostrando o tutorial, avança para o próximo passo
      this.nextTutorialStep();
    } else if (this.showStory) {
      // Se está mostrando a história, avança para o próximo passo
      this.nextStoryStep();
    }
  }
  
  nextTutorialStep(): void {
    if (this.currentTutorialStep < this.totalTutorialSteps) {
      this.currentTutorialStep++;
    } else {
      // Finalizar o tutorial e mostrar a história
      this.showTutorial = false;
      this.showStory = true;
    }
  }
  
  nextStoryStep(): void {
    if (this.currentStoryStep < this.totalStorySteps) {
      this.currentStoryStep++;
    } else {
      // Finalizar a história e iniciar o jogo
      this.showStory = false;
      this.createCanvas(); // Inicia o jogo
    }
  }
  
  skipStory(): void {
    this.showStory = false;
    this.createCanvas(); // Inicia o jogo
  }
  
  skipTutorial(): void {
    this.showTutorial = false;
    this.showStory = true; // Mostrar a história depois de pular o tutorial
  }
  
  goToTutorialStep(step: number): void {
    if (step >= 1 && step <= this.totalTutorialSteps) {
      this.currentTutorialStep = step;
    }
  }
  
  restartGame(): void {
    this.gameService.resetGame();
  }
}
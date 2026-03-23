import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { AudioManager } from '../systems/AudioManager';

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InstructionsScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // Register shutdown cleanup
    this.events.once('shutdown', this.shutdown, this);

    this.add.text(GAME_WIDTH / 2, 30, 'COMO JOGAR', {
      fontSize: '28px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS ||
      (this.sys.game.device.input.touch && window.innerWidth < 1024);

    let yPos = 70;
    const lineH = 22;

    // Controls section
    this.add.text(40, yPos, 'CONTROLES:', {
      fontSize: '16px', color: '#ffeb3b', fontFamily: 'Arial', fontStyle: 'bold'
    });
    yPos += lineH + 4;

    if (isMobile) {
      this.addLine(40, yPos, 'D-Pad', 'Mover para esquerda/direita'); yPos += lineH;
      this.addLine(40, yPos, 'Botão A', 'Pular (segure para pular mais alto)'); yPos += lineH;
      this.addLine(40, yPos, 'Botão B', 'Correr / Atirar sementes'); yPos += lineH;
    } else {
      this.addLine(40, yPos, '← → ou A/D', 'Mover'); yPos += lineH;
      this.addLine(40, yPos, 'ESPAÇO ou ↑', 'Pular (segure para pular mais alto)'); yPos += lineH;
      this.addLine(40, yPos, 'SHIFT', 'Correr'); yPos += lineH;
      this.addLine(40, yPos, 'Z ou X', 'Atirar sementes (com poder)'); yPos += lineH;
    }

    yPos += 10;

    // Power-ups section
    this.add.text(40, yPos, 'POWER-UPS:', {
      fontSize: '16px', color: '#ffeb3b', fontFamily: 'Arial', fontStyle: 'bold'
    });
    yPos += lineH + 4;

    // Recycling symbol
    this.add.image(56, yPos + 8, 'powerup-recycle').setScale(0.8);
    this.add.text(80, yPos, 'Símbolo da Reciclagem - Cresce e fica resistente', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial'
    });
    yPos += lineH + 4;

    // Ipê seed
    this.add.image(56, yPos + 8, 'powerup-ipe').setScale(0.8);
    this.add.text(80, yPos, 'Semente de Ipê - Atira esferas purificadoras', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial'
    });
    yPos += lineH + 4;

    // Solar panel
    this.add.image(56, yPos + 8, 'powerup-solar').setScale(0.8);
    this.add.text(80, yPos, 'Energia Solar - Invencibilidade temporária', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial'
    });
    yPos += lineH + 10;

    // Enemies section
    this.add.text(40, yPos, 'INIMIGOS:', {
      fontSize: '16px', color: '#ffeb3b', fontFamily: 'Arial', fontStyle: 'bold'
    });
    yPos += lineH + 4;

    this.add.image(56, yPos + 8, 'enemy-goomba-0').setScale(0.9);
    this.add.text(80, yPos, 'Goomba do Lixo - Pule em cima para reciclar!', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial'
    });
    yPos += lineH + 4;

    this.add.image(56, yPos + 8, 'enemy-koopa-0').setScale(0.9);
    this.add.text(80, yPos, 'Koopa Tóxico - Pise e chute a lata!', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial'
    });
    yPos += lineH + 10;

    // Objective
    this.add.text(40, yPos, 'OBJETIVO:', {
      fontSize: '16px', color: '#ffeb3b', fontFamily: 'Arial', fontStyle: 'bold'
    });
    yPos += lineH + 2;
    this.add.text(40, yPos, 'Limpe a poluição do colégio, derrote os inimigos\ne resgate a Muda de Ouro!', {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial', lineSpacing: 4,
    });

    // Back button
    const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '[ VOLTAR ]', {
      fontSize: '18px',
      color: '#4caf50',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setScale(1.1));
    backBtn.on('pointerout', () => backBtn.setScale(1));
    backBtn.on('pointerdown', () => {
      AudioManager.getInstance().playMenuConfirm();
      this.scene.start('TitleScene');
    });

    this.input.keyboard?.on('keydown-ESC', () => this.scene.start('TitleScene'));
    this.input.keyboard?.on('keydown-ENTER', () => this.scene.start('TitleScene'));
  }

  shutdown(): void {
    this.input.keyboard?.removeAllListeners();
  }

  private addLine(x: number, y: number, key: string, desc: string): void {
    this.add.text(x, y, key, {
      fontSize: '13px', color: '#90caf9', fontFamily: 'Arial', fontStyle: 'bold'
    });
    this.add.text(x + 150, y, desc, {
      fontSize: '13px', color: '#ffffff', fontFamily: 'Arial'
    });
  }
}

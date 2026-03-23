export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private zKey!: Phaser.Input.Keyboard.Key;
  private xKey!: Phaser.Input.Keyboard.Key;

  // Virtual gamepad state
  public virtualLeft = false;
  public virtualRight = false;
  public virtualUp = false;
  public virtualJump = false;
  public virtualAction = false;
  public virtualShootTriggered = false;
  public isMobile = false;

  private dpad?: Phaser.GameObjects.Image;
  private btnA?: Phaser.GameObjects.Image;
  private btnB?: Phaser.GameObjects.Image;
  private btnPause?: Phaser.GameObjects.Container;
  private activePointers: Map<number, 'dpad' | 'buttons'> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.checkMobile();
    if (this.isMobile) {
      this.setupVirtualGamepad();
    }
  }

  private setupKeyboard(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.scene.input.keyboard.addKey('W'),
        A: this.scene.input.keyboard.addKey('A'),
        S: this.scene.input.keyboard.addKey('S'),
        D: this.scene.input.keyboard.addKey('D'),
      };
      this.shiftKey = this.scene.input.keyboard.addKey('SHIFT');
      this.zKey = this.scene.input.keyboard.addKey('Z');
      this.xKey = this.scene.input.keyboard.addKey('X');
    }
  }

  private checkMobile(): void {
    const device = this.scene.sys.game.device;
    this.isMobile = device.os.android || device.os.iOS ||
      (device.input.touch && window.innerWidth < 1024);
  }

  private vibrate(ms: number): void {
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
    } catch (_) { /* ignore */ }
  }

  private setupVirtualGamepad(): void {
    const cam = this.scene.cameras.main;

    // Larger D-pad on left — positioned higher and bigger
    this.dpad = this.scene.add.image(90, cam.height - 90, 'dpad')
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.55)
      .setScale(1.15)
      .setInteractive();

    // A button (jump) — bigger, positioned for comfortable thumb reach
    this.btnA = this.scene.add.image(cam.width - 70, cam.height - 110, 'btn-a')
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.55)
      .setScale(1.5)
      .setInteractive();

    // B button (run/action) — bigger, separated from A
    this.btnB = this.scene.add.image(cam.width - 155, cam.height - 65, 'btn-b')
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.55)
      .setScale(1.3)
      .setInteractive();

    // Mobile pause button (top-right corner) — larger touch target
    const pauseBg = this.scene.add.graphics();
    pauseBg.fillStyle(0x000000, 0.5);
    pauseBg.fillRoundedRect(-22, -16, 44, 32, 8);
    const pauseText = this.scene.add.text(0, 0, '❚❚', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.btnPause = this.scene.add.container(cam.width - 30, 22, [pauseBg, pauseText])
      .setScrollFactor(0)
      .setDepth(1000)
      .setSize(50, 38)
      .setInteractive({ useHandCursor: true });

    this.btnPause.on('pointerdown', () => {
      this.vibrate(15);
      this.scene.input.keyboard?.emit('keydown-P', { key: 'P' });
    });

    // Touch handlers
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleTouch(pointer, true));
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) this.handleTouch(pointer, true);
    });
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.handleTouch(pointer, false));
  }

  private handleTouch(pointer: Phaser.Input.Pointer, isDown: boolean): void {
    const cam = this.scene.cameras.main;
    const px = pointer.x;
    const py = pointer.y;
    const id = pointer.id;

    if (!isDown) {
      const region = this.activePointers.get(id);
      if (region === 'dpad') {
        this.virtualLeft = false;
        this.virtualRight = false;
        this.virtualUp = false;
      } else if (region === 'buttons') {
        this.virtualJump = false;
        this.virtualAction = false;
      }
      this.activePointers.delete(id);
      if (region === 'dpad' && this.dpad) this.dpad.setAlpha(0.55);
      if (region === 'buttons') {
        if (this.btnA) this.btnA.setAlpha(0.55);
        if (this.btnB) this.btnB.setAlpha(0.55);
      }
      return;
    }

    const prevRegion = this.activePointers.get(id);

    // D-pad region (left side of screen)
    if (px < cam.width / 2) {
      this.activePointers.set(id, 'dpad');
      if (prevRegion === 'buttons') {
        this.virtualJump = false;
        this.virtualAction = false;
      }

      const dpadX = 90;
      const dpadY = cam.height - 90;
      const dx = px - dpadX;
      const dy = py - dpadY;

      // Expanded touch area (90px radius instead of 70)
      if (Math.abs(dx) < 90 && Math.abs(dy) < 90) {
        const wasLeft = this.virtualLeft;
        const wasRight = this.virtualRight;
        const wasUp = this.virtualUp;

        this.virtualLeft = dx < -12;
        this.virtualRight = dx > 12;
        this.virtualUp = dy < -12;

        // Haptic feedback on direction change
        if ((!wasLeft && this.virtualLeft) || (!wasRight && this.virtualRight) || (!wasUp && this.virtualUp)) {
          this.vibrate(8);
        }
      } else {
        this.virtualLeft = false;
        this.virtualRight = false;
        this.virtualUp = false;
      }

      if (this.dpad) this.dpad.setAlpha(0.8);
    }

    // Buttons region (right side of screen)
    if (px > cam.width / 2) {
      this.activePointers.set(id, 'buttons');
      if (prevRegion === 'dpad') {
        this.virtualLeft = false;
        this.virtualRight = false;
        this.virtualUp = false;
      }

      const btnAX = cam.width - 70;
      const btnAY = cam.height - 110;
      const btnBX = cam.width - 155;
      const btnBY = cam.height - 65;

      const distA = Math.sqrt((px - btnAX) ** 2 + (py - btnAY) ** 2);
      const distB = Math.sqrt((px - btnBX) ** 2 + (py - btnBY) ** 2);

      const prevJump = this.virtualJump;
      const prevAction = this.virtualAction;

      this.virtualJump = false;
      this.virtualAction = false;

      // Expanded hit areas (45px for A, 40px for B instead of 35/30)
      if (distA < 45) {
        this.virtualJump = true;
        if (this.btnA) this.btnA.setAlpha(0.95);
        if (!prevJump) this.vibrate(12);
      } else {
        if (this.btnA) this.btnA.setAlpha(0.55);
      }
      if (distB < 40) {
        if (!this.virtualAction) {
          this.virtualShootTriggered = true;
        }
        this.virtualAction = true;
        if (this.btnB) this.btnB.setAlpha(0.95);
        if (!prevAction) this.vibrate(12);
      } else {
        if (this.btnB) this.btnB.setAlpha(0.55);
      }
    }
  }

  get left(): boolean {
    return this.cursors?.left?.isDown || this.wasd?.A?.isDown || this.virtualLeft;
  }

  get right(): boolean {
    return this.cursors?.right?.isDown || this.wasd?.D?.isDown || this.virtualRight;
  }

  get up(): boolean {
    return this.cursors?.up?.isDown || this.wasd?.W?.isDown || this.virtualUp;
  }

  get jump(): boolean {
    return this.cursors?.space?.isDown || this.cursors?.up?.isDown || this.wasd?.W?.isDown || this.virtualJump;
  }

  get run(): boolean {
    return this.shiftKey?.isDown || this.virtualAction;
  }

  get shoot(): boolean {
    const kbShoot = Phaser.Input.Keyboard.JustDown(this.zKey) ||
      Phaser.Input.Keyboard.JustDown(this.xKey);
    if (this.virtualShootTriggered) {
      this.virtualShootTriggered = false;
      return true;
    }
    return kbShoot;
  }

  destroy(): void {
    this.dpad?.destroy();
    this.btnA?.destroy();
    this.btnB?.destroy();
    this.btnPause?.destroy();
    if (this.isMobile) {
      this.scene.input.off('pointerdown');
      this.scene.input.off('pointermove');
      this.scene.input.off('pointerup');
    }
  }
}

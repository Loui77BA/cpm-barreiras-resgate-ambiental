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
  private btnPause?: Phaser.GameObjects.Text;
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

  private setupVirtualGamepad(): void {
    const cam = this.scene.cameras.main;

    // D-pad on left
    this.dpad = this.scene.add.image(80, cam.height - 80, 'dpad')
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.7)
      .setScale(0.9)
      .setInteractive();

    // A button (jump) on right
    this.btnA = this.scene.add.image(cam.width - 80, cam.height - 100, 'btn-a')
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.7)
      .setScale(1.2)
      .setInteractive();

    // B button (run/action) on right
    this.btnB = this.scene.add.image(cam.width - 150, cam.height - 60, 'btn-b')
      .setScrollFactor(0)
      .setDepth(1000)
      .setAlpha(0.7)
      .setScale(1.0)
      .setInteractive();

    // Mobile pause button (top-right corner)
    this.btnPause = this.scene.add.text(cam.width - 16, 8, '| |', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#00000066',
      padding: { x: 8, y: 4 },
    }).setScrollFactor(0).setDepth(1000).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    this.btnPause.on('pointerdown', () => {
      this.scene.input.keyboard?.emit('keydown-P', { key: 'P' });
    });

    // Touch handlers for d-pad
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
      // Only clear the state owned by this specific pointer
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
      // Reset visual feedback
      if (region === 'dpad' && this.dpad) this.dpad.setAlpha(0.7);
      if (region === 'buttons') {
        if (this.btnA) this.btnA.setAlpha(0.7);
        if (this.btnB) this.btnB.setAlpha(0.7);
      }
      return;
    }

    // Determine which region this pointer belongs to
    const prevRegion = this.activePointers.get(id);

    // Check d-pad region (left side)
    if (px < cam.width / 2) {
      this.activePointers.set(id, 'dpad');
      // If this pointer was previously in buttons, clear button state
      if (prevRegion === 'buttons') {
        this.virtualJump = false;
        this.virtualAction = false;
      }

      const dpadX = 80;
      const dpadY = cam.height - 80;
      const dx = px - dpadX;
      const dy = py - dpadY;

      // Only reset/recompute dpad if THIS pointer owns the dpad
      if (Math.abs(dx) < 70 && Math.abs(dy) < 70) {
        this.virtualLeft = dx < -15;
        this.virtualRight = dx > 15;
        this.virtualUp = dy < -15;
      } else {
        // Pointer left the dpad dead zone — clear only if this pointer owns dpad
        this.virtualLeft = false;
        this.virtualRight = false;
        this.virtualUp = false;
      }

      // Visual feedback
      if (this.dpad) this.dpad.setAlpha(0.9);
    }

    // Check buttons region (right side)
    if (px > cam.width / 2) {
      this.activePointers.set(id, 'buttons');
      // If this pointer was previously on dpad, clear dpad state
      if (prevRegion === 'dpad') {
        this.virtualLeft = false;
        this.virtualRight = false;
        this.virtualUp = false;
      }

      const btnAX = cam.width - 80;
      const btnAY = cam.height - 100;
      const btnBX = cam.width - 150;
      const btnBY = cam.height - 60;

      const distA = Math.sqrt((px - btnAX) ** 2 + (py - btnAY) ** 2);
      const distB = Math.sqrt((px - btnBX) ** 2 + (py - btnBY) ** 2);

      // Reset button states for this pointer before recomputing
      this.virtualJump = false;
      this.virtualAction = false;

      if (distA < 35) {
        this.virtualJump = true;
        if (this.btnA) this.btnA.setAlpha(1.0);
      } else {
        if (this.btnA) this.btnA.setAlpha(0.7);
      }
      if (distB < 30) {
        if (!this.virtualAction) {
          // First frame pressing B — trigger shoot once
          this.virtualShootTriggered = true;
        }
        this.virtualAction = true;
        if (this.btnB) this.btnB.setAlpha(1.0);
      } else {
        if (this.btnB) this.btnB.setAlpha(0.7);
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

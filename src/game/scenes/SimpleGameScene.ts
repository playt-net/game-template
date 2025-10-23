import { Scene } from 'phaser';
import { EventBus } from '@game/EventBus';
import api from '@client/clientConfig';
import { playt } from '@client/clientConfig';

export class SimpleGameScene extends Scene {
	private titleText!: Phaser.GameObjects.Text;
	private exitButton!: Phaser.GameObjects.Rectangle;
	private addScoreButton!: Phaser.GameObjects.Rectangle;
	private subtractScoreButton!: Phaser.GameObjects.Rectangle;
	private scoreText!: Phaser.GameObjects.Text;
	private currentScore = 0;
	private musicSound!: Phaser.Sound.BaseSound;

	constructor() {
		super({ key: 'SimpleGameScene' });
	}

	create() {
		const { width, height } = this.cameras.main;

		this.cameras.main.setBackgroundColor('#2c3e50');

		// Play background music
		this.musicSound = this.sound.add('music', { loop: true, volume: 0.5 });
		this.musicSound.play();

		this.titleText = this.add
			.text(width / 2, height / 2 - 100, 'SimpleGameScene', {
				fontSize: '48px',
				color: '#ecf0f1',
				fontFamily: 'Arial, sans-serif',
				fontStyle: 'bold',
			})
			.setOrigin(0.5);

		this.add
			.text(
				width / 2,
				height / 2,
				'This is a simple game scene template.\nYou can start building your game here!',
				{
					fontSize: '20px',
					color: '#bdc3c7',
					fontFamily: 'Arial, sans-serif',
					align: 'center',
					wordWrap: { width: width * 0.8 },
				},
			)
			.setOrigin(0.5);

		// Score display
		this.scoreText = this.add
			.text(width / 2, height / 2 + 50, `Score: ${this.currentScore}`, {
				fontSize: '24px',
				color: '#f1c40f',
				fontFamily: 'Arial, sans-serif',
				fontStyle: 'bold',
			})
			.setOrigin(0.5);

		// Add +10 Score Button
		this.addScoreButton = this.createScoreButton(
			width / 2 - 80,
			height / 2 + 100,
			'+10',
			'#27ae60',
			() => this.updateScore(10),
		);

		// Add -10 Score Button
		this.subtractScoreButton = this.createScoreButton(
			width / 2 + 80,
			height / 2 + 100,
			'-10',
			'#e74c3c',
			() => this.updateScore(-10),
		);

		this.exitButton = this.createExitButton(width / 2, height / 2 + 150, () => {
			this.handleContinue(this.exitButton);
		});

		this.tweens.add({
			targets: this.titleText,
			scaleX: 1.1,
			scaleY: 1.1,
			duration: 1000,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});

		EventBus.emit('current-scene-ready', 'SimpleGameScene');
	}

	private createExitButton(
		x: number,
		y: number,
		callback: () => void,
	): Phaser.GameObjects.Rectangle {
		const buttonWidth = 100;
		const buttonHeight = 50;

		const button = this.add
			.rectangle(x, y, buttonWidth, buttonHeight, 0x95a5a6)
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		const buttonText = this.add
			.text(x, y, 'EXIT', {
				fontSize: '20px',
				color: '#ffffff',
				fontFamily: 'Arial, sans-serif',
				fontStyle: 'bold',
			})
			.setOrigin(0.5);

		button.on('pointerover', () => {
			if (!button.input?.enabled) return;
			button.setFillStyle(0x7f8c8d);
		});

		button.on('pointerout', () => {
			if (!button.input?.enabled) return;
			button.setFillStyle(0x95a5a6);
		});

		button.on('pointerdown', () => {
			if (!button.input?.enabled) return;
			button.setScale(0.95);
		});

		button.on('pointerup', () => {
			if (!button.input?.enabled) return;
			button.setScale(1);
			callback();
		});

		return button;
	}

	private createScoreButton(
		x: number,
		y: number,
		text: string,
		color: string,
		callback: () => void,
	): Phaser.GameObjects.Rectangle {
		// Create button background
		const button = this.add
			.rectangle(
				x,
				y,
				120,
				50,
				Phaser.Display.Color.HexStringToColor(color).color,
			)
			.setInteractive({ useHandCursor: true });

		// Create button text
		const buttonText = this.add
			.text(x, y, text, {
				fontSize: '20px',
				color: '#ffffff',
				fontFamily: 'Arial, sans-serif',
				fontStyle: 'bold',
			})
			.setOrigin(0.5);

		// Add hover effects
		button.on('pointerover', () => {
			button.setAlpha(0.8);
			buttonText.setScale(1.1);
		});

		button.on('pointerout', () => {
			button.setAlpha(1);
			buttonText.setScale(1);
		});

		button.on('pointerdown', () => {
			button.setAlpha(0.6);
			buttonText.setScale(0.95);
		});

		button.on('pointerup', () => {
			button.setAlpha(1);
			buttonText.setScale(1);
			callback();
		});

		return button;
	}

	private async updateScore(amount: number) {
		this.currentScore += amount;
		this.scoreText.setText(`Score: ${this.currentScore}`);

		try {
			await api.submitScore(this.currentScore);
			console.log(`Score updated: ${this.currentScore}`);
		} catch (error) {
			console.error('Failed to submit score:', error);
		}
	}

	private async handleContinue(
		button: Phaser.GameObjects.Rectangle,
	): Promise<void> {
		button.disableInteractive();
		button.setAlpha(0.85);

		// Stop background music and play gameover sound
		this.musicSound.stop();
		this.sound.play('gameover');

		try {
			await api.submitFinalScore(this.currentScore);
			console.log(`Final score submitted: ${this.currentScore}`);

			await playt.quitMatch();
			EventBus.emit('end-scene-continue');

			if (this.scene.isActive('Game2048Scene')) {
				this.scene.stop('Game2048Scene');
			}

			this.tweens.add({
				targets: button.parentContainer ?? button,
				alpha: { from: 1, to: 0 },
				duration: 400,
				ease: 'Power1',
				onComplete: () => {
					this.scene.stop();
				},
			});
		} catch (error) {
			console.error('Failed to submit final score or quit match:', error);
			button.setAlpha(1);
			button.setInteractive({ useHandCursor: true });
		}
	}
}

import { Scene } from 'phaser';
import api from '../../client/clientConfig';
import { EventBus } from '@game/EventBus';

export class LoadingScene extends Scene {
	private loadingText!: Phaser.GameObjects.Text;
	private playerToken = '';
	private progressBar!: Phaser.GameObjects.Graphics;
	private progressBox!: Phaser.GameObjects.Graphics;
	private error = false;
	private loadingErrorCounter = 0;

	constructor() {
		super({ key: 'LoadingScene' });
	}

	init() {
		console.log('started');
		// Get token from URL parameters
		const params = new URLSearchParams(window.location.search);
		const playerToken = params.get('playerToken');

		if (!playerToken) {
			console.error('No player token found, showing error');
			this.showError('No player token provided in URL');
			return;
		}
		this.playerToken = playerToken;
		EventBus.emit('current-scene-ready', 'LoadingScene');
	}

	preload() {
		const { width, height } = this.cameras.main;

		this.progressBar = this.add.graphics();
		this.progressBox = this.add.graphics();
		this.progressBar.setToTop();

		this.progressBox.fillStyle(0xdddddd, 0.8);
		const boxWidth = 320;
		const boxHeight = 50;
		this.progressBox.fillRoundedRect(
			width / 2 - boxWidth / 2,
			height / 2 - boxHeight / 2,
			boxWidth,
			boxHeight,
			10,
		);

		this.loadingText = this.add
			.text(width / 2, height / 2 - 50, 'Loading...', {
				fontSize: '32px',
				color: '#000',
			})
			.setOrigin(0.5);

		this.load.on('progress', (value: number) => {
			this.progressBar.clear();
			this.progressBar.fillStyle(0xf86a52);

			this.progressBar.fillRoundedRect(
				width / 2 - 150,
				height / 2 - 15,
				300 * value,
				30,
				8,
			);
		});

		this.load.on('loaderror', () => {
			if (this.loadingErrorCounter > 3) {
				this.showError('Error loading assets!');
				return;
			}
			this.loadingErrorCounter++;
			this.scene.restart();
		});

		// Load sounds
		this.load.audio('music', 'music.ogg');
		this.load.audio('gameover', 'gameover.ogg');
	}

	async create() {
		if (!this.playerToken) {
			console.error('No player token found');
			this.showError('No player token found');
			return;
		}

		const response = await api.getMatch();

		if (!response) {
			this.showError('No response received from server');
			return;
		}

		const matchId = response.id;
		if (!matchId) {
			this.showError('No match ID received from server');
			return;
		}

		const userId = response.player?.userId;
		if (!userId) {
			this.showError('No user ID received from server');
			return;
		}

		if (response.status !== 'running') {
			this.showError('Match is not running');
			return;
		}

		this.progressBar.destroy();
		this.progressBox.destroy();
		this.loadingText.destroy();

		if (this.error) {
			return;
		}

		if (response.player?.finalScore) {
			return;
		}

		// Start the simple game scene
		this.scene.start('SimpleGameScene');
	}

	private showError(message: string) {
		this.error = true;
		if (this.loadingText?.scene) {
			this.loadingText.destroy();
		}
		if (this.progressBar?.scene) {
			this.progressBar.destroy();
		}
		if (this.progressBox?.scene) {
			this.progressBox.destroy();
		}

		const { width, height } = this.cameras.main;

		this.add
			.text(width / 2, height / 2 - 50, 'Error', {
				fontSize: '32px',
				color: '#ff0000',
			})
			.setOrigin(0.5);

		this.add
			.text(width / 2, height / 2 + 10, message, {
				fontSize: '24px',
				color: '#000000',
				align: 'center',
				wordWrap: { width: width * 0.8 },
			})
			.setOrigin(0.5);

		this.add
			.text(width / 2, height / 2 + 80, 'Retry', {
				fontSize: '24px',
				color: '#ffffff',
				backgroundColor: '#444444',
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true })
			.on('pointerdown', () => {
				this.error = false;
				this.scene.restart();
			});
	}
}

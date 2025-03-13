import type { Game as PhaserGame } from "phaser";
import { useEffect, useRef, useState } from "react";
import useGameEvents from "./hooks/useGameEvents";
import { createGame } from "@game/Game";

function App() {
	const gameContainerRef = useRef<HTMLDivElement>(null);
	const gameInstanceRef = useRef<PhaserGame | null>(null);
	const [_containerWidth, setContainerWidth] = useState<number>(0);

	const { currentActiveScene } = useGameEvents();

	useEffect(() => {
		if (gameContainerRef.current) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setContainerWidth(entry.contentRect.width);
				}
			});

			resizeObserver.observe(gameContainerRef.current);
			setContainerWidth(gameContainerRef.current.offsetWidth);

			return () => resizeObserver.disconnect();
		}
	}, []);

	useEffect(() => {
		if (gameContainerRef.current && !gameInstanceRef.current) {
			gameInstanceRef.current = createGame(gameContainerRef.current.id);
		}

		return () => {
			if (gameInstanceRef.current) {
				gameInstanceRef.current.destroy(true);
				gameInstanceRef.current = null;
			}
		};
	}, []);

	return (
		<div className="grid grid-rows-[100px_auto] grid-flow-row justify-items-center content-start pb-2">
			Scene:{currentActiveScene}
			<div
				id="game-container"
				ref={gameContainerRef}
				className="col-start-1 row-start-2 max-w-full"
			/>
		</div>
	);
}

export default App;

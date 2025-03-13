import { useEffect, useState } from "react";
import { EventBus } from "@game/EventBus";

const useGameEvents = () => {
	const [currentActiveScene, setCurrentActiveScene] = useState("");

	useEffect(() => {
		EventBus.on("current-scene-ready", setCurrentActiveScene);
		return () => {
			EventBus.off("current-scene-ready", setCurrentActiveScene);
		};
	}, []);

	return {
		currentActiveScene,
	};
};

export default useGameEvents;

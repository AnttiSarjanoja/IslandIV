/// <reference path="player_color.ts" />

// --- Interfaces for province and game settings .jsons ---

// Provincesettings mostly contain front-end stuff,
// with exception of neighbours and names, which are needed by server too
interface ProvinceSettings {
	mapIMG: string, // File, must be located at /img/
	provinces: ProvinceData[],
}
interface ProvinceData {
	x: number,
	y: number,
	name: string,
	neighbours: number[], // Cannot be empty!
}

// InitProvinceData is only used when creating game to populate new entities
interface InitProvinceData {
	// Beasts
	// Neutral forces (prolly only ancient civilizations)
	population: number, // Population (as in starting amt or neutral humans)
	size: number, // Room for population (which is reduced by beasts)
	resources: string[], // Predefined med / high value resources
	// Terraintype ???
}
interface InitPlayerData {
	startingLocation: number,
	color: PlayerColor,
	name: string,
	description: string,

	gold: number,
	mp: number,
	faith: number[],
	techs: string[]
}
interface InitData {
	provinces: InitProvinceData[],
	players: InitPlayerData[], // Also works as playerAmt
}

// GameSettings contain unit rules (power, cost etc.), and images for customization
interface GameSettings {
	// Imagefiles for stuff, must be located at /img/
	provinceIMG: string,
	unitIMG: string,
}
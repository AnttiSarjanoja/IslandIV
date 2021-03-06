/// <reference path="player_color.ts" />

// --- Interfaces for province and game settings .jsons ---

// Provincesettings mostly contain front-end stuff,
// with exception of neighbours and names, which are needed by server too
interface ProvinceSettings {
	mapIMG: string, // File, must be located at /img/
	maskIMG: string,
	provinces: ProvinceData[],
	borders: Border[],
	points: BorderPoint[]
}
interface ProvinceData {
	x: number, // Text place
	y: number,
	r: number, // Rotation
	s: number, // Scale
	unit_x: number;
	unit_y: number;
	name: string,
	terrain: Terrain,
	borders: number[] // Index of border in settings
}
type Terrain =
	"Plains" |
	"Flood plains" |
	"Forest" |
	"Hills" |
	"Mountains" |
	"Sea" |
	"Deep sea"
interface Border {
	borderPoints: number[], // Index of point in settings
	borderType?: BorderType
}
type BorderPoint = [number, number, boolean]; // [x,y,invis]
type BorderType =
	"Normal" |
	"River";

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
	startingLocations: number[],
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
	defaultIMGs: string[], // matches SettingsIMGnames
	playerIMGs: string[][] // matches SettingsIMGnames
}

let SettingsIMGnames = ["province", "infantry", "cavalry", "population"];

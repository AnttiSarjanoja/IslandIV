// Interfaces for province and game settings .jsons
interface ProvinceData {
	x: number,
	y: number,
	name: string,
	neighbours: number[] // Cannot be empty!
}

interface ProvinceSettings {
	map: string,
	provinces: ProvinceData[]
}

interface GameSettings {
	// Images for stuff, must be located at /img/
	provinceIMG: string,
	unitIMG: string
}
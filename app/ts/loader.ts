/// <reference path="game.ts" />
/// <reference path="main.ts" />
/// <reference path="player.ts" />
/// <reference path="province.ts" />
/// <reference path="../../common/settings.ts" />

// This class contacts the server / loads dev files
namespace IslandIV {
	export class GameLoader {
		// These are the stuff to load
		public GameData: IGame | null = null; // TODO: Game
		public ProvinceSettings: ProvinceSettings | null = null;
		public GameSettings: GameSettings | null = null;
		public PixiResources: PIXI.loaders.Resource | null = null;

		get Validate(): boolean {
			return (
				this.GameData !== null &&
				this.ProvinceSettings !== null &&
				this.GameSettings !== null &&
				this.PixiResources !== null)
		}

		constructor (
			private cb: () => void // The given cb to call after being done
		) {
			// Anything here?
		}

		// TODO: Make cb call happen always
		public Load() {
			console.log("Started loading");
			let dataRequest = new XMLHttpRequest();
			dataRequest.open('GET', 'data', true);
			dataRequest.responseType = 'json';
			dataRequest.onload = () => {
				console.log("Got dataresponse");
				this.GameData = dataRequest.response; // TODO: Check response, fail => call cb
				this.loadOtherStuff();
			};
			dataRequest.send();
		}

		private loadOtherStuff() {
			if (this.GameData === null) throw new Error("GAhhh");

			console.log("Loading other stuff");
			let provinceRequest = new XMLHttpRequest();
			provinceRequest.open('GET', "./settings/" + this.GameData.provinceFile, true); // TODO: Undefined -> Default file?
			provinceRequest.responseType = 'json';
			provinceRequest.onload = () => {
				console.log("Got provinceresponse");
				this.saveProvinceSettings(provinceRequest.response); // TODO: Check response, fail => call cb
				if (this.GameSettings) this.loadImages();
			};

			let settingsRequest = new XMLHttpRequest();
			settingsRequest.open('GET', "./settings/" + this.GameData.settingsFile, true); // TODO: Undefined -> Default file?
			settingsRequest.responseType = 'json';
			settingsRequest.onload = () => {
				console.log("Got settingsresponse");
				this.GameSettings = settingsRequest.response; // TODO: Check response, fail => call cb
				if (this.ProvinceSettings) this.loadImages();
			};

			provinceRequest.send();
			settingsRequest.send();
		}

		private loadImages() {
			if (this.ProvinceSettings === null || this.GameSettings === null) throw new Error("Gah");
			console.log("Loading images");

			// Not very sophisticated atm, just loads all hardcoded images
			let pixiLoader: PIXI.loaders.Loader = new PIXI.loaders.Loader('./img/');
			pixiLoader.add('map', this.ProvinceSettings.mapIMG);
			pixiLoader.add('map-mask', this.ProvinceSettings.maskIMG);
			pixiLoader.add('unit', this.GameSettings.unitIMG); // Prolly temporary, if using spritesheets
			pixiLoader.add('province', this.GameSettings.provinceIMG);

			// TODO: Do we want spritesheets? TexturePacker produces simple spritesheets with JSON, is free
			// loader.add(sprite_sheets_arr);
			pixiLoader.load((loader : PIXI.loaders.Loader, resources : PIXI.loaders.Resource) => {
				console.log("Images loaded");
				this.PixiResources = resources; // TODO: Check response, fail => call cb
				this.cb();
			});
		}

		private saveProvinceSettings(data: any) { // Any since it really can be anything (?)
			if (data === undefined) throw new Error("No response for ProvinceSettings!");
			this.ProvinceSettings = data; // TODO: Need to validate map and array?
			this.ProvinceSettings!.provinces.forEach((province: ProvinceData, index: number) => {
				if (province.x === undefined) throw new Error("Provincedata error: (" + index + ") No x-coord!");
				if (province.y === undefined) throw new Error("Provincedata error: (" + index + ") No y-coord!");
				
				/* TODO: Move these to "after creating everything" -validation			
				if (province.neighbours === undefined) throw new Error("Provincedata error: (" + index + ") No neighbours!");
				if (province.neighbours.length === 0) throw new Error("Provincedata error: (" + index + ") Empty neighbours!");
				if (province.neighbours.some((neighbour: ProvinceNeighbour) => { return neighbour.neighbourIndex === index; }))
					throw new Error("Provincedata error: (" + index + ") Self as neighbour!");

				province.neighbours.forEach((neighbour) => {
					if (!this.ProvinceSettings!.provinces[neighbour.neighbourIndex].neighbours.some(
						(candidate) => { return index === candidate.neighbourIndex; }))
					{
						throw new Error("Provincedata error: (" + index + ") No pair neighbour with (" + neighbour + ")!");
					}
				});*/
			});
		}
	}
}
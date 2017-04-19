/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../map/mapContainer.ts" />
/// <reference path="../drawable/drawable.ts" />
/// <reference path="../order.ts" />

namespace IslandIV {
	// Static class
	export abstract class Input {
		public static MapContainer: MapContainer;

		public static Init(map: MapContainer) {
			this.MapContainer = map;
			window.onresize = () => this.MapContainer.Resize();
			document.addEventListener("keyup", (evt : KeyboardEvent) => this.handleKeyUp(evt));
		}

		public static WindowKeys() {
			this.keylock = true;
		}
		public static WindowKeysOff() {
			this.keylock = false;
		}

		private static keylock: boolean = false;
		// TODO: Should work, just feels a bit shady. Could use a sorted array of handlers of (evt) => boolean
		private static handleKeyUp (evt: KeyboardEvent) {
			if (this.keylock) return;
			if (CurrentGame.EditorMode) {
				if (evt.keyCode === 82 && this.province) this.province[0].RotateClockwise(); // 'r'
				if (evt.keyCode === 84 && this.province) this.province[0].RotateCounterClockwise(); // 't'
				if (evt.keyCode === 70 && this.province) { this.province[0].ScaleUp(); } // 'f'
				if (evt.keyCode === 71 && this.province) { this.province[0].ScaleDown(); } // 'g'
				if (evt.keyCode === 81) UI.Download(CurrentGame.ProvinceSettings, "DefaultProvinces"); //CurrentGame.GetCurrentSettings(); // 'q'
				if (evt.keyCode === 78 && this.province) { // 'n'
					UI.InputWindow("Text input", (s: string) => {
						this.province![0].Text!.text = s;
						this.province![0].Name = s;
					});
				}
			}
			else {

			}
			// Add all keyboard handlers 
			if (this.MapContainer.handleEvt(evt)) return;
			if (evt.keyCode === 83) Order.SendOrders(); // 's'
			
			if (evt.keyCode === 77) UI.QueryWindow("Map-editor", () => { CurrentGame.InitMapEditor(); }, "Really open map-editor?");
			// else console.log("No handler for key '" + evt.key + "'");
		}

		// Selected
		private static province: [Province, Selectable] | undefined;
		private static units: [UnitToken, Selectable][] = [];
		private static borderpoint: [MapBorderPoint, Selectable] | undefined;

		public static Select (token: any, selectable: Selectable) {
			if (token instanceof Province) {
				if (this.province) this.province[1].Unselect();
				this.province = [token, selectable];
			}
			else if (token instanceof UnitToken) {
				if (this.units.length > 0 && this.units[0][0].Province !== token.Province) {
					this.units.forEach(u => u[1].Unselect());
					this.units = [];
				}
				this.units.push([token, selectable]);
			}
			else if (token instanceof MapBorderPoint) {
				if (this.borderpoint) this.borderpoint[1].Unselect();
				this.borderpoint = [token, selectable];	
			}
		}

		public static UnSelect (token: any, selectable: Selectable) {
			if (token instanceof Province) {
				this.province = undefined;
			}
			else if (token instanceof UnitToken) {
				
			}
		}

		public static ClearSelect () {
			// this.selected = [];
		}
	}
}

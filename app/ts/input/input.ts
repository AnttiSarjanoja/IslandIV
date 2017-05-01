/// <reference path="../../pixi-typescript/pixi.js.d.ts" />
/// <reference path="../map/mapContainer.ts" />
/// <reference path="../drawable/drawable.ts" />
/// <reference path="../order.ts" />

namespace IslandIV {
	type InputMode =
		"Normal" |
		"EditorAddBorder" |
		"EditorAddPoint" |
		"EditorAddProvince"

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
		private static changeMode(mode: InputMode) {
			this.mode = mode;
			UI.ModeToRight([mode]);
		}

		private static mode: InputMode = "Normal";
		private static keylock: boolean = false;
		// TODO: Should work, just feels a bit shady. Could use a sorted array of handlers of (evt) => boolean
		private static handleKeyUp (evt: KeyboardEvent) {
			if (this.keylock) { return; }
			if (CurrentGame.EditorMode) {
				// Province modifications
				if (evt.keyCode === 78 && this.province) { // 'n', new text
					UI.InputWindow("Text input", (s: string) => {
						this.province![0].Text!.text = s;
						this.province![0].Name = s;
					});
				}
				if (evt.keyCode === 69 && this.province) this.province[0].RotateClockwise(); // 'e'
				if (evt.keyCode === 82 && this.province) this.province[0].RotateCounterClockwise(); // 'rs'
				if (evt.keyCode === 68 && this.province) this.province[0].ScaleUp(); // 'd'
				if (evt.keyCode === 70 && this.province) this.province[0].ScaleDown(); // 'f'
				if (evt.keyCode === 65 && this.province && this.border) { // 'a'
					this.province[0].MapProvince.ToggleBorder(this.border[0]);
					SortStage();
				}

				if (evt.keyCode === 84 && this.province) { this.province[0].SwitchTerrain(); }

				// Borderpoint modifications
				if (evt.keyCode === 80) { // 'p'
					this.changeMode("EditorAddPoint");
					this.MapContainer.Container.once('pointerup', (evt: PIXI.interaction.InteractionEvent) => {
						this.changeMode("Normal");
						MapBorderPoint.New(evt);
					});
				}
				if (evt.keyCode === 79) { // 'o'
					this.changeMode("EditorAddProvince");
					this.MapContainer.Container.once('pointerup', (evt: PIXI.interaction.InteractionEvent) => {
						Province.Dummy(evt.data.getLocalPosition(Stage));
						this.changeMode("Normal");
					});
				}
				if (evt.keyCode === 73 && this.borderpoint) { this.borderpoint[0].invis = !this.borderpoint[0].invis; }
				if (evt.keyCode === 88) { // 'x'
					let destroyed: boolean = false;
					if (this.province) {
						destroyed = true;
						this.province[0].Destroy();
						this.province[1].Unselect();
					}
					if (this.border) {
						if (!destroyed) {
							destroyed = true;
							this.border[0].Destroy();
						}
						this.border[1].Unselect();
					}
					if (this.borderpoint) {
						if (!destroyed) this.borderpoint[0].Destroy();
						this.borderpoint[1].Unselect();
					}
				}

				// Border modifications
				if (evt.keyCode === 66) { // 'b'
					if (this.borderpoint) {
						this.borderpoint[1].Unselect();
						this.borderpoint = undefined;
					}
					if (this.mode === "EditorAddBorder") {
						this.changeMode("Normal");
						this.border![1].Unselect();
						this.border = undefined;

					}
					else {
						this.changeMode("EditorAddBorder");
						this.border ?	this.border[0].Clear() : this.border = [MapBorder.New(), Selectable.Latest];
					}
				}

				// Load current layout
				if (evt.keyCode === 81) UI.Download(CurrentGame.ProvinceSettings, "DefaultProvinces"); //CurrentGame.GetCurrentSettings(); // 'q'
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
		private static border: [MapBorder, Selectable] | undefined;

		public static Select (token: any, selectable: Selectable) {
			if (token instanceof Province) {
				if (this.province) this.province[1].Unselect(); // Unselect the old one
				if (this.border) this.border[1].Unselect(); // Unselect the old one

				this.province = [token, selectable];
				if (CurrentGame.EditorMode) {
					selectable.Children = token.MapProvince.Borders.map(b => b.Selectable);
					selectable.Children.forEach(c => c.ChildSelect());
				}
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
				if (this.mode === "EditorAddBorder") this.border![0].TogglePoint(token);
			}
			else if (token instanceof MapBorder) {
				if (this.border) this.border[1].Unselect();
				this.border = [token, selectable];		
			}
		}

		public static UnSelect (token: any, selectable: Selectable) {
			if (token instanceof Province) {
				this.province = undefined;
			}
			else if (token instanceof MapBorder) {
				if (token.Points.length == 0) token.Destroy();
				this.border = undefined;
			}
			else if (token instanceof MapBorderPoint) {
				// if (this.mode === "EditorAddBorder") this.border![0].TogglePoint(token);
			}
		}

		public static ClearSelect () {
			// this.selected = [];
		}
	}
}

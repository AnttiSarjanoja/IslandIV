/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/draw_settings.ts" />
/// <reference path="province.ts" />
/// <reference path="unitToken.ts" />
/// <reference path="../../common/interfaces.ts" />

namespace IslandIV {
	// An army consists of all units of a single player in a single province / order
	export class Army extends Drawable implements IArmy {
		readonly ownerID: number | undefined = undefined; 
		readonly units: UnitList = {}; // This contains original values
		readonly Province: Province;

		public Order: Order | undefined = undefined; // TODO: Mb better solution for checking if army is in a order?

		private _amounts: UnitList = {}; // This contains modified values
		private tokens: UnitToken[] = [];

		get Amounts(): UnitList { return this._amounts; }
		get Empty(): boolean { return this.tokens.length <= 0; }

		constructor(data: IArmy | undefined, province: Province) {
			super(); // Does not have a basic picture
			this.Container.name = "4_army";
			this.Province = province;

			if (data === undefined) { return; } // Must be able to create empty containers e.g. for orders
			this.ownerID = data.ownerID;

			// Create tokens by type and amount
			this.units = data.units;
			for (var key in this.units) {
				for (var i = 0; i < this.units[key]; i++) {
					this.AddToken(new UnitToken(this, <UnitType>key));
				}
			}
		}

		public AddToken(token: UnitToken): void {
			token.Army = this;
			this.tokens.push(token);
			this._amounts[token.Type] = this._amounts[token.Type] !== undefined ? this._amounts[token.Type]! + 1 : 1;
			this.Container.addChild(token.Container);
			this.rearrangeTokens();
		}

		// NOTE: This does not destroy the PIXI Container, it is callers duty
		public RemoveToken(token: UnitToken): void {
			if (this.tokens.some(t => t == token)) {
				this.tokens.splice(this.tokens.indexOf(token), 1);
				this._amounts[token.Type] = this._amounts[token.Type]! - 1;
				token.Container.position.set(0, 0); // Just to be sure
				this.Container.removeChild(token.Container);
				this.rearrangeTokens();
			}
		}

		// This sorts the tokens by type with a small x between tokens
		private rearrangeTokens() {
			// TODO: Proper sorting!
			this.tokens.sort((a, b) => a.Type === "cavalry" ? -1 : 1);
			this.tokens.forEach((token, i) => token.Container.x = i * ARMY_TOKEN_GAP);
			this.Container.children = this.tokens.map(t => t.Container);
			this.CenterContainer(true);
		}
	}
}
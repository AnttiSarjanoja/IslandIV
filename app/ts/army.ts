/// <reference path="drawable/drawable.ts" />
/// <reference path="unitToken.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />

namespace IslandIV {
	// An army consists of all units of a single player in a single province / order
	export class Army extends Drawable implements IArmy {
		readonly ownerID: number | null = null; 
		readonly units: UnitList = {};
		readonly Province: Province;
		private amounts: UnitList = {};
		public Order: Order | null = null; // Any better solution?
		private tokens: UnitToken[] = [];

		get Empty(): boolean {
			return this.tokens.length <= 0; // As we really want only to know if tokens are extinct
			/*
			for (var key in this.units) {
				if (this.units[key] > 0) return false;
			}
			return true; */
		}

		constructor(data: IArmy | null, color: PlayerColor, province: Province, id: number | null = null) {
			super(); // Does not have a basic picture
			this.ownerID = id; // TODO:
			this.Province = province;

			if (data === null) return; // Must be able to create empty containers
			this.units = data.units;
			for (var key in this.units) {
				for (var i = 0; i < this.units[key]; i++) {
					this.AddToken(new UnitToken(this, <UnitType>key)); // TODO: Sooo ugly, works?
				}
			}
			this.changeTint(ColorToNumber(color));
		}

		public AddToken(token: UnitToken): void {
			token.Army = this;

			// This horrible hack works with optional string literal type indices
			let amount: number | undefined = this.amounts[token.Type] !== undefined ? this.amounts[token.Type] : 0;
			if (amount !== undefined) this.amounts[token.Type] = amount + 1;

			this.tokens.push(token);
			this.Container.addChild(token.Container);
			this.rearrangeTokens();
		}

		public RemoveToken(token: UnitToken): void {
			let index: number = this.tokens.indexOf(token);
			if (index > -1) {
				token.Container.x = 0; // Just to be sure
				token.Container.y = 0;

				let amount: number | undefined = this.amounts[token.Type];
				if (amount) this.amounts[token.Type] = amount - 1;

				this.tokens.splice(index, 1);
				this.Container.removeChild(token.Container);
				this.rearrangeTokens();
			}
			else console.log("Något gick fel!");
			// TODO: if this.tokens.length === 0
		}

		public Amounts(): UnitList {
			return this.amounts;
		}

		// This sorts the tokens by type, shows them over a baseline with a small x between tokens
		private rearrangeTokens () {
			// TODO: Proper sorting!
			this.tokens.sort((a, b) => {
				if (a.Type === "cavalry" && b.Type !== "cavalry") return -1;
				else return 1;
			});
			let childArray: PIXI.DisplayObject[] = []; // So ugly
			this.tokens.forEach((token, i) => {
				childArray.push(token.Container);
				token.Container.x = i * 6;
				token.Container.y = 10 - (token.Container.height / 2);
			});
			this.Container.children = childArray;

			this.CenterContainer();
		}
	}
}
/// <reference path="drawable/drawable.ts" />
/// <reference path="unitToken.ts" />
/// <reference path="../../common/interfaces.ts" />
/// <reference path="../../common/player_color.ts" />

// An army consists of all units of a single player in a single province / order
class Army extends Drawable implements IArmy {
	readonly units: { [unit in UnitType]: number }; // Modifications are made to tokens mb?
	readonly Province: Province;
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

	constructor(data: IArmy | null, color: PlayerColor, province: Province) {
		super(); // Does not have a basic picture
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
		// TODO: Add tokens to a baseline, e.g. x = 10 is the lowest point from which all sprites are above
		token.Army = this;
		this.tokens.push(token);
		this.Container.addChild(token.Container);
		this.rearrangeTokens();
	}

	public RemoveToken(token: UnitToken): void {
		let index: number = this.tokens.indexOf(token);
		if (index > -1) {
			token.Container.x = 0; // Just to be sure
			token.Container.y = 0;
			this.tokens.splice(index, 1);
			this.Container.removeChild(token.Container);
			this.rearrangeTokens();
		}
		else console.log("Något gick fel!");
		// TODO: if this.tokens.length === 0
	}

	private rearrangeTokens () {
		// TODO: Proper sorting!
		this.tokens.sort((a: UnitToken, b: UnitToken) => {
			if (a.Type === "cavalry" && b.Type !== "cavalry") return -1;
			else return 1;
		});
		let childArray: PIXI.DisplayObject[] = []; // So ugly
		this.tokens.forEach((token: Token, i: number) => {
			childArray.push(token.Container);
			token.Container.x = i * 6;
			token.Container.y = 0; // Just to be sure
		});
		this.Container.children = childArray;

		this.CenterContainer();
	}
}
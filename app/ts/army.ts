/// <reference path="player_color.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="unitToken.ts" />
/// <reference path="../../server/interfaces.ts" />

// An army consists of all units of a single player in a single province / order
class Army extends Drawable implements IArmy {
	units: { [unit in UnitType]: number }; // Ehh, cannot be private :(, but must be modifiable

	readonly Province: Province;
	public Order: Order | null = null; // Any better solution?
	private tokens: UnitToken[] = [];

	get Empty(): boolean {
		for (var key in this.units) {
			if (this.units[key] > 0) return false;
		}
		return true;
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
			this.rearrangeTokens();
		}
		// TODO: if this.tokens.length === 0
	}

	private rearrangeTokens () {
		// TODO: Sort by type
		this.tokens.forEach((token: Token, i: number) => {
			token.Container.x = i * 6;
			token.Container.y = 0; // Just to be sure
		});
		this.CenterContainer();
	}
}
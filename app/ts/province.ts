/// <reference path="army.ts" />
/// <reference path="drawable.ts" />
/// <reference path="player.ts" />
/// <reference path="../../server/interfaces.ts" />

class Province extends Drawable implements IProvince {
	readonly id: number;
	readonly armies: Army[];
	readonly size: number;
	readonly population: number;
	readonly resources: string[];

	public constructor(x : number, y : number, color : PlayerColor) {
		super(x, y, 'img/bunny.png');
		this.changeTint(ColorToNumber(color));
	}
}
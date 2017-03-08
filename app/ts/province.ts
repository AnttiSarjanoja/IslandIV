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
}
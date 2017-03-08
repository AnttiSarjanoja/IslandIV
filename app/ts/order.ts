/// <reference path="player.ts" />
/// <reference path="../../server/interfaces.ts" />

class Order implements IOrder {
	readonly turn: number;
	readonly type: string;
	readonly state: string;
	readonly parameters: string[] = [];

	// Ok, something like this:
	// Type = Moveorder
	// Parameter[1] = What moves
	// Parameter[2] = Where moves (may be path through provinces?)
	// 
	// Type = Build
	// Parameter[1] = What to build
	// Parameter[2] = Where to build

	// NOTE: Just make subclasses if we hardcode possible orders
}

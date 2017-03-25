/// <reference path="player.ts" />
/// <reference path="../../server/interfaces.ts" />

abstract class Order implements IOrder {
	readonly turn: number;
	readonly type: string;
	readonly state: string;
	readonly parameters: string[] = [];

	// NOTE: Just make subclasses for possible orders
	constructor (data: IOrder) {
		this.turn = data.turn;
		this.type = data.type;
		this.state = data.state;
		this.parameters = data.parameters;
	}

	private static newOrders: Order[] = [];

	public static SendOrders() {
		let request = new XMLHttpRequest();
		request.open("POST", "/orders");
		request.setRequestHeader("Content-Type", "application/json");
		request.send(JSON.stringify(this.newOrders));
	}
}

// Only parameters-array should be given to new orders, turn and state are optional for old orders
class MoveOrder extends Order {
	// Ok, something like this:
	// Type = 'Move'
	// Parameter[1] = From where moves
	// Parameter[2] = What moves
	// Parameter[3] = Where moves (may be a path through provinces?)

	public static Create(fromProvince: Province, toProvince: Province, unit: Unit) {
		// 1. Validate
		// TODO:
		// 2. Update sprites
		toProvince.AddUnit(unit); // TODO: Temp -> make arrow or something with the moving unit
		fromProvince.RemoveUnit(unit);

		// 3. Create and store orders

	}

	private constructor (parameters: string[], turn: number = 0, state: string = "New") { 
		super({
			turn: turn, // TODO: turn from Game
			type: "Move",
			state: state,
			parameters: []
		});
	}
}

// Type = Build
// Parameter[1] = What to build
// Parameter[2] = Where to build

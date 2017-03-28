/// <reference path="player.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/drawableBase.ts" />
/// <reference path="../../server/interfaces.ts" />

abstract class Order extends Drawable implements IOrder {
	readonly turn: number;
	readonly type: string;
	readonly state: string;
	readonly parameters: string[] = [];

	// NOTE: Just make subclasses for possible orders
	constructor (data: IOrder, spritedata?: DrawableSprite) {
		super(spritedata);
		this.turn = data.turn;
		this.type = data.type;
		this.state = data.state;
		this.parameters = data.parameters;
	}

	private static newOrders: Order[] = [];

	public static SendOrders() { // 
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

	private static created: MoveOrder[] = [];

	public static Create(fromProvince: Province, toProvince: Province, unit: UnitToken) {
		// 1. Validate
		if (!fromProvince.Neighbours.some((value: number) => { return value === (toProvince.id); })) {
			console.log("Not a neighbour!");
			return;
		}

		// Remove from old container
		//unit.Container.;
		if (unit.Order !== null && unit.Order instanceof MoveOrder) unit.Order.RemoveToken(unit);

		// Check if identical order already exists
		let found: MoveOrder[] = this.created.filter(function (order: MoveOrder) {
			return order.parameters[0] === fromProvince.id.toString() &&
				order.parameters[1] === toProvince.id.toString() &&
				order.parameters[2] === unit.Type;
		});
		if (found.length > 0) {
			console.log("Found already");
			found[0].AddToken(unit);
			return;
		}

		// Otherwise create new and store it
		let newOrder: MoveOrder = new MoveOrder(
			[fromProvince.id.toString(), toProvince.id.toString(), unit.Type],
			fromProvince.Container.position,
			toProvince.Container.position,
			fromProvince);
		newOrder.AddToken(unit);

		unit.Army.RemoveToken(unit);
		
		this.created.push(newOrder);
	}

	private static remove(order: MoveOrder) {
		let index: number = this.created.indexOf(order);
		if (index > -1) {
			this.created.splice(index, 1);
		}
	}

	private army: Army;

	// Private for validation reasons
	private constructor (parameters: string[], start: PIXI.Point, end: PIXI.Point, province: Province) { 
		super({
			turn: 0, // TODO: turn from Game
			type: "Move",
			state: "New",
			parameters: parameters
		});

		// Center position of the new order, as in middle point between provinces
		let mapPos: PIXI.Point = new PIXI.Point((start.x + end.x) / 2, (start.y + end.y) / 2);

		// The arrow should not start nor end in province Point, calculate weighed average
		let calcStart: PIXI.Point = new PIXI.Point((start.x * 15 + end.x) / 16 - mapPos.x, (start.y * 15 + end.y) / 16 - mapPos.y);
		let calcEnd: PIXI.Point = new PIXI.Point((start.x + end.x * 2) / 3 - mapPos.x, (start.y + end.y * 2) / 3 - mapPos.y);

		this.Container.x = mapPos.x;
		this.Container.y = mapPos.y;
		this.AddGraphics("Arrow", calcStart, calcEnd); // This does not even need CenterContainer()

		this.army = new Army(null, "RED", province); // Dummyarmy for order
		this.army.Container.x = calcEnd.x;
		this.army.Container.y = calcEnd.y - 10;
		this.Container.addChild(this.army.Container);

		DrawableBase.Ticker(this.TickFn);
		DrawableBase.Add(this.Container);
	}

	public AddToken(unit: UnitToken) {
		this.army.AddToken(unit); // TEMP
		unit.Army.Order = this;
	}

	public RemoveToken(unit: UnitToken) {
		this.army.RemoveToken(unit);
		if (this.army.Empty) {
			this.destroy();
		}
	}

	private destroy() {
		this.Container.destroy();
		MoveOrder.remove(this);
		DrawableBase.RemoveTicker(this.TickFn);
	}

	private TickFn = (delta: number) => {
		this.army.Container.y -= Math.sin(DrawableBase.TickerTime / 2);
	}
}

// Type = Build
// Parameter[1] = What to build
// Parameter[2] = Where to build

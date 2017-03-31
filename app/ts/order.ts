/// <reference path="game.ts" />
/// <reference path="main.ts" />
/// <reference path="player.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/drawableBase.ts" />
/// <reference path="../../common/interfaces.ts" />

abstract class Order extends Drawable implements IOrder {
	readonly turn: number;
	readonly type: string;
	readonly state: string;
	readonly parameters: any[] = [];

	// NOTE: Just make subclasses for possible orders
	constructor (data: IOrder, spritedata?: DrawableSprite) {
		super(spritedata);
		this.turn = data.turn;
		this.type = data.type;
		this.state = data.state;
		this.parameters = data.parameters;
	}

	protected static newOrders: Order[] = [];

	// NOTE: Orders are smart and contain complex structures with sprites etc.
	//	In this function the obsolete stuff are stripped and only IOrder specific data is sent
	public static SendOrders() {
		let strippedOrders: IOrder[] = this.newOrders.map((order: Order) => {
			return { turn: order.turn, type: order.type, state: order.state, parameters: order.parameters };
		});
		let sentObj: Object = { player: Game.CurrentPlayer.id, turn: IslandIV.Game.turn, orders: strippedOrders };
		console.log(JSON.stringify(sentObj));

		let request = new XMLHttpRequest();
		request.open("POST", "/orders");
		request.setRequestHeader("Content-Type", "application/json");
		request.send(JSON.stringify(sentObj)); // TODO: Is stringify here ok?
	}
}

// Only parameters-array should be given to new orders, turn and state are optional for old orders
class MoveOrder extends Order {
	// Ok, something like this:
	// Type = 'Move'
	// Parameter[1] = From where moves
	// Parameter[2] = What moves
	// Parameter[3] = Where moves (may be a path through provinces?)

	// private static created: MoveOrder[] = [];

	// TODO: Tidy this, order is somewhat messy
	public static Create(fromProvince: Province, toProvince: Province, unit: UnitToken) {
		// 1. Validate
		if (fromProvince !== toProvince && !fromProvince.Neighbours.some((value: number) => { return value === (toProvince.id); })) {
			console.log("Not a neighbour!");
			return;
		}

		// Remove from old Order and check if returning to Province
		if (unit.Order !== null && unit.Order instanceof MoveOrder) {
			unit.Order.RemoveToken(unit);
			if (fromProvince === toProvince) {
				unit.Province.AddToken(unit);
				return;
			}
		}
		else unit.Army.RemoveToken(unit);

		// Check if identical order already exists
		let found: Order[] = Order.newOrders.filter(function (order: Order) {
			return (
				order instanceof MoveOrder &&
				order.parameters[0] === fromProvince.id.toString() &&
				order.parameters[1] === toProvince.id.toString()
			);
		});
		if (found.length > 0) {
			let mOrder: Order = found[0];
			if (mOrder instanceof MoveOrder) {
				mOrder.AddToken(unit);
				return;
			}
		}

		// Otherwise create new and store it
		let newOrder: MoveOrder = new MoveOrder(
			[fromProvince.id.toString(), toProvince.id.toString()],
			fromProvince.Container.position,
			toProvince.Container.position,
			fromProvince);
		newOrder.AddToken(unit);

		Order.newOrders.push(newOrder);
	}

	private static remove(order: MoveOrder) {
		let index: number = Order.newOrders.indexOf(order);
		if (index > -1) {
			Order.newOrders.splice(index, 1);
		}
	}

	private army: Army;

	// Private for validation reasons
	private constructor (parameters: string[], start: PIXI.Point, end: PIXI.Point, province: Province) { 
		super({
			turn: IslandIV.Game.turn,
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

		this.army = new Army(null, Game.CurrentPlayer.color, province); // Dummyarmy for order
		this.army.Order = this;
		this.army.Container.x = calcEnd.x;
		this.army.Container.y = calcEnd.y - 10;
		this.Container.addChild(this.army.Container);

		DrawableBase.Ticker(this.TickFn);
		DrawableBase.Add(this.Container);
	}

	// These exist only to update parameters
	public AddToken(unit: UnitToken) {
		this.army.AddToken(unit);
		this.parameters[2] = this.army.Amounts();
	}
	public RemoveToken(unit: UnitToken) {
		// TODO: Update parameters
		this.army.RemoveToken(unit);
		if (this.army.Empty) {
			this.Destroy();
		}
		else this.parameters[2] = this.army.Amounts();
	}

	public Destroy() {
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

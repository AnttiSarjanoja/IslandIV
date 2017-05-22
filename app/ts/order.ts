/// <reference path="game.ts" />
/// <reference path="main.ts" />
/// <reference path="player.ts" />
/// <reference path="drawable/drawable.ts" />
/// <reference path="drawable/shapes.ts" />
/// <reference path="../../common/interfaces.ts" />

namespace IslandIV {
	export abstract class Order extends Drawable implements IOrder {
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

		public static NewOrders: Order[] = [];

		// NOTE: Orders are smart and contain complex structures with sprites etc.
		//	In this function the obsolete stuff are stripped and only IOrder specific data is sent
		public static SendOrders() {
			let strippedOrders: IOrder[] = this.NewOrders.map(order =>
				({ turn: order.turn, type: order.type, state: order.state, parameters: order.parameters })
			);
			let sentObj: Object = { player: CurrentGame.CurrentPlayer.id, turn: CurrentGame.turn, orders: strippedOrders };
			console.log(JSON.stringify(sentObj));

			let request = new XMLHttpRequest();
			request.open("POST", "/orders");
			request.setRequestHeader("Content-Type", "application/json");
			request.send(JSON.stringify(sentObj));
		}
	}

	// TODO: Separate file
	export class MoveOrder extends Order {
		// Type = 'Move'
		// Parameter[1] = From where moves
		// Parameter[2] = Where moves (may be a path through provinces?)
		// Parameter[3] = What moves, type = UnitList
		
		public static Create(fromProvince: Province, toProvince: Province, unit: UnitToken) {
			if (fromProvince !== toProvince && !fromProvince.Neighbours.some(n => n === toProvince)) {
				console.log("Not a neighbour!");
				return;
			}

			if (unit.Order === null && fromProvince === toProvince) { return; }

			// Remove from old Order and check if returning to Province
			if (unit.Order !== null && unit.Order instanceof MoveOrder) {
				unit.Order.RemoveToken(unit);
				if (fromProvince === toProvince) {
					unit.Province.AddToken(unit);
					return;
				}
			}
			else { unit.Army.RemoveToken(unit); }

			// Check if identical order already exists
			let found: Order | undefined = Order.NewOrders.find(order =>
				order instanceof MoveOrder &&
				order.parameters[0] === fromProvince.id.toString() &&
				order.parameters[1] === toProvince.id.toString()	
			);
			if (found && found instanceof MoveOrder) {
				found.AddToken(unit);
				return;
			}

			// Otherwise create new and store it
			let newOrder: MoveOrder = new MoveOrder(
				[fromProvince.id.toString(), toProvince.id.toString()],
				fromProvince.Armypos,
				toProvince.Armypos,
				fromProvince);
			newOrder.AddToken(unit);

			Order.NewOrders.push(newOrder);
		}

		private static remove(order: MoveOrder) {
			let index: number = Order.NewOrders.indexOf(order);
			if (index > -1) {	Order.NewOrders.splice(index, 1);	}
		}

		private army: Army;

		// Private for validation reasons
		private constructor (parameters: string[], start: PIXI.Point, end: PIXI.Point, province: Province) { 
			super({
				turn: CurrentGame.turn,
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
			this.Container.addChild(Shapes.MapMoveArrow(calcStart, calcEnd));

			this.army = new Army(undefined, province); // Dummyarmy for order
			this.army.Order = this;
			this.army.Container.x = calcEnd.x;
			this.army.Container.y = calcEnd.y - 10;
			this.Container.addChild(this.army.Container);

			Ticker.add(this.TickFn);
			Stage.addChild(this.Container);
		}

		// These exist only to update parameters
		public AddToken(unit: UnitToken) {
			this.army.AddToken(unit);
			this.parameters[2] = this.army.Amounts;
		}
		public RemoveToken(unit: UnitToken) {
			// TODO: Update parameters
			this.army.RemoveToken(unit);
			if (this.army.Empty) { this.Destroy(); }
			else { this.parameters[2] = this.army.Amounts; }
		}

		public Destroy() {
			this.army.Container.destroy();
			this.Container.destroy();
			MoveOrder.remove(this);
			Ticker.remove(this.TickFn);
		}

		private TickFn = (delta: number) => {
			this.army.Container.y -= Math.sin(TickerTime / 2);
		}
	}

	// Type = Build
	// Parameter[1] = What to build
	// Parameter[2] = Where to build
}
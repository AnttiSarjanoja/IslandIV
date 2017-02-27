/// <reference path="drawable.ts" />
/// <reference path="player_color.ts" />

// This class will be used for all game-mechanic related units including troops and settlements

// TODO: Separate classes for effects etc.
// TODO: Inherit Drawable
class Token extends Drawable {
	// NOTE: Does not need coordinates mb? Understood via drawable.sprite

	// TODO: What does token actually contain? Should cover basically all the pieces in the game
	// TODO: How to contain unit-specific data without types from classes? Unless we just hard-code classes for everything

	private ID : number; // TODO: unique on its own type, server compatible
	private name : string; // Not unique
	private type : string; // TODO: Cannot be enum since types may come from the configuration from server, string is ok ?
	// TODO: If string, must have getter and setter that check the type validation from configurations

	// TODO: Do we use factories?
	public static Create(x : number, y : number, color : PlayerColor) : Token {
		let created : Token = new Token(x, y);
		created.changeTint(ColorToNumber(color));
		return created;
	}
}


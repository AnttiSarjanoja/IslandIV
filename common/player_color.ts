type PlayerColor =
	"GREEN" |
	"RED" |
	"BLUE" |
	"YELLOW" |
	"PURPLE" |
	"ORANGE" |
	"GRAY" |
	"ERROR" // TODO: Should use this?

function ColorToNumber(color: PlayerColor) : number {
	switch(color) {
	case "GREEN":  return 0x88FF88;
	case "RED":    return 0xFF8888;
	case "BLUE":   return 0x0000FF;
	case "YELLOW": return 0xFFFF00;
	case "PURPLE": return 0x800080;
	case "ORANGE": return 0xFFA500;
	case "GRAY":   return 0x111111;
	}
	console.log("Faulty player color warning!");
	return 0xFFFFFF; // TODO: Error color
}

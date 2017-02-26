// TODO: Must be server compatible
class Order {
	private type : string;
	private parameters : string[] = [];
	private comment : string; // May be used, user can write notes for themselves when giving order

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
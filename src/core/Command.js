function Command(name, settings, fn) {
	if (!fn || typeof fn != "function") {
		throw "Invalid function provided";
	}
}
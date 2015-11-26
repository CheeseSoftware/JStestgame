var Hud = function() {

	this._isCreated = false;
	this._content = null;

	return this;
}

Hud.prototype.create = function() {
	if (this._isCreated) {
		console.log("Error: Hud.create is called when Hud is already created!");
		return;
	}
	this._isCreated = true;

	var client = new XMLHttpRequest();
	client.open('GET', 'hud.html');
	client.onreadystatechange = (function() {
		this._content = client.responseText;

		$("body").prepend("<p> HEJ! JAG ÄR GLAD! </p>");
		$("body").prepend(this._content);
		console.log(this._content);

		$("#health").replaceWith("<h1 id='health'> Health: 1337 hp </h1>");

	}).bind(this);
	client.send();

}

Hud.prototype.destroy = function() {
	if (!this._isCreated) {
		console.log("Error: Hud.destroy is called when Hud isn't created!");
		return;
	}
	this._isCreated = false;



}

Hud.prototype.onHealthChange = function(health) {
	$("#health").replaceWith("<h1 id='health'> Health: " + health + " hp </h1>");
}

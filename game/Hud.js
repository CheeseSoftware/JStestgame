var Hud = function() {

	this._isCreated = false;
	this._content = null;
	this._player = null;

	return this;
}

Hud.prototype.initPlayer = function(player) {
	var health = player.getComponent('health');
	health.subscribe(this);
	this.player = player;

	if (this._content != null)
		this.onHealthChange(player.getComponent('health'));

	$("#hud").show();
};

Hud.prototype.create = function() {
	if (this._isCreated) {
		return;
	}
	this._isCreated = true;

	var client = new XMLHttpRequest();
	client.open('GET', 'hud.html');
	client.onreadystatechange = (function() {
		if (this._content != null || client.responseText == "")
			return;

		this._content = client.responseText;

		$("body").prepend(this._content);
		console.log(this._content);

		$("#hud").hide();


		var health = 0;
		if (this._player)
			health = this._player.getComponent('health').value;

		$("#health").replaceWith("<h1 id='health'> Health: " + health + " hp </h1>");
		console.log("ok!");

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
	$("#health").replaceWith("<h1 id='health'> Health: " + health.value + " hp </h1>");
}

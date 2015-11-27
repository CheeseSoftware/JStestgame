ECS.Components.Health = CES.Component.extend({});

ECS.Components.Health.prototype.init = function (maxHealth) {
	jQuery.extend(this, new Observable(["onHealthChange", "onDeath"]));
	this.name = 'health';
	this.max = maxHealth;
	this.value = maxHealth;
}

ECS.Components.Health.prototype.doDamage = function(damage) {
	this.value = Math.max(this.value - damage, 0.0);
	this.on("onHealthChange", [this]);
}


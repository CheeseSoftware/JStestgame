ECS.Components.Health = CES.Component.extend({
    name: 'health',
    init: function (maxHealth) {
		this.max = maxHealth;
		this.value = maxHealth;
    }
});
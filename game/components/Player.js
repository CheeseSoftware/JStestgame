
ECS.Components.Player = CES.Component.extend({
    name: 'player',
    init: function (username, text) {
        this.username = username;
		this.text = text;
		this.lastDig = new Date();
		this.digSpeed = 5;
    }
});
 
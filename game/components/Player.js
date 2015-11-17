
ECS.Components.Player = CES.Component.extend({
    name: 'player',
    init: function (username, sprite, text) {
        this.username = username;
		this.text = text;
		this.lastDig = new Date();
    }
});
 
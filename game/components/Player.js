
ECS.Components.Player = CES.Component.extend({
    name: 'player',
    init: function (uuid, username, text) {
		this.uuid = uuid;
        this.username = username;
		this.text = text;
		this.lastDig = new Date();
    }
});
 
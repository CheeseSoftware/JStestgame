
ECS.Components.Player = CES.Component.extend({
    name: 'player',
    init: function (username) {
        this.username = username;
		this.digSpeed = 5;
    }
});
 
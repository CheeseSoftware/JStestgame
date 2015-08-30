
ECS.Components.ControlledPlayer = CES.Component.extend({
    name: 'controlledplayer',
    init: function () {
		this.oldRot = 0;
		this.oldx = 0;
		this.oldy = 0;
		this.oldvx = 0;
		this.oldvy = 0;
    }
});
 
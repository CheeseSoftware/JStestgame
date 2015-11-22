
ECS.Components.AI = CES.Component.extend({
    name: 'AI',
    init: function () {
		this.target = null;
		this.lastPacket = new Date();
    }
});
 
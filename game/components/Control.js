/* 
 * Control component is used for both players and monsters.
 */
ECS.Components.Control = CES.Component.extend({
    name: 'control',
    init: function () {
    	this.moveDir = [0.0, 0.0];
    	this.isUsingTool = false;
    	this.isChanged = false;
    }
});
  

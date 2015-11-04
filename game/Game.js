Game = function() {
	// Initialize window
	this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight,{backgroundColor : 0xF00000}, true, false);
	this.renderer.clearBeforeRender = false;
	document.body.appendChild(this.renderer.view);
	this.stage = new PIXI.Container();
	this.camera = new Camera(this.stage);	
	this.camera.zoom = 1.0;
	
	this.entityWorld = new CES.World();
	
	var gl = this.renderer.gl;
	this._chunkManager = new ChunkManager();
	this._chunkRenderer = new ChunkRenderer(gl, this._chunkManager, 32, 32, 32, 32);
	this._chunkManager.fillCircle(13, 13, 4.2, 0);

	// Add more systems here!
	this.entityWorld.addSystem(new ECS.Systems.PhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.TerrainPhysicsSystem());
	this.entityWorld.addSystem(new ECS.Systems.ControlSystem());
	
	var gravity = new b2Vec2(0, 0);
	var doSleep = false;
	this.physicsWorld = new b2World(gravity, doSleep); 
	
	this._intervalId = setInterval(function(){game.run()}, 0);
	
	this.connection = new Connection(vars.ip, 3000);
}

Game.prototype.resize = function() {
	this.renderer.resize(window.innerWidth, window.innerHeight);
	this.camera.width = window.innerWidth;
	this.camera.height = window.innerHeight;

}

Game.prototype.run = function() {
    var now = Date.now();
    var dt = now - this.lastUpdate;
	this.lastUpdate = Date.now()
	
    this.entityWorld.update(dt);
	
	this.physicsWorld.Step(1 / 60.0, 10, 10);
	            this.physicsWorld.DrawDebugData();
            this.physicsWorld.ClearForces();
	
	this.camera.update(dt);
	this._chunkManager.update(this.camera);
	
	
	var gl = this.renderer.gl;
	this.renderer.setRenderTarget(this.renderer.renderTarget);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	var projectionMatrix = this.renderer.renderTarget.projectionMatrix.clone();
	var viewMatrix = new PIXI.Matrix();
	viewMatrix = viewMatrix.translate(-this.camera.frustrum.x, -this.camera.frustrum.y);
	this._chunkRenderer.render(gl, this._chunkManager, projectionMatrix.clone().append(viewMatrix), this.camera);

	
	this.renderer.render(this.camera);
	
};
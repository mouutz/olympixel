var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var hero; 

const createScene = async function () {
    
    var scene = new BABYLON.Scene(engine);

    createScene.collisionsEnabled = false;
    

    
    hero = BABYLON.MeshBuilder.CreateSphere("hero", {diameter: 2}, scene);
    hero.position = new BABYLON.Vector3(10, 1.5, 0);
    hero.checkCollisions = true;
    hero.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    hero.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);


    var camera = new BABYLON.FollowCamera("followCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.lockedTarget = hero; // La caméra suit le perso
    camera.heightOffset = 25; 
    camera.radius = 50; 
    camera.rotationOffset = 0; 
    camera.cameraAcceleration = 0.05; 
    camera.maxCameraSpeed = 20; 

    // Rotation de la caméra avec la souris
    scene.activeCamera.attachControl(canvas, true);


    // Configuration de la scène
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
    scene.fogDensity = 0.005;
    scene.fogEnabled = false;
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
    

    
        
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.3; 

    
    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-0.5, -1, 0.5), scene); 
    light.position = new BABYLON.Vector3(20, 100, -20); 
    light.intensity = 0.1;

    // Sol
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 200, height: 200, subdivisions: 8 }, scene);
    ground.position = new BABYLON.Vector3(0, 0, 0);
    ground.visibility = false;
    ground.checkCollisions = true;




    await BABYLON.SceneLoader.AppendAsync(
        "assets/models/",
        "polycity2.glb",
        scene
    ).then(function () {
        scene.meshes.forEach(function (mesh) {
            mesh.checkCollisions = true;
        });
    
    });

    

    
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
    scene.collisionsEnabled = true;

    return scene;
};


createScene().then(function (createdScene) {
    createdScene.debugLayer.show({
        enablePhysicsViewer: true,
        enableBoundingBoxRenderer: false,
        enableCollisionMeshesDebug: false
    });
    

    //  clavier
    var inputMap = {};
    createdScene.actionManager = new BABYLON.ActionManager(createdScene);
    createdScene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = true;
    }));
    createdScene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = false;
    }));

    engine.runRenderLoop(function () {
        if (createdScene.activeCamera) {
            createdScene.render();
        }
    
       
        var heroSpeed = 0.1;
        if (inputMap["z"] || inputMap["Z"]) {
            hero.position.z -= heroSpeed; 
        }
        if (inputMap["s"] || inputMap["S"]) {
            hero.position.z += heroSpeed; 
        }
        if (inputMap["q"] || inputMap["Q"]) {
            hero.position.x += heroSpeed; 
        }
        if (inputMap["d"] || inputMap["D"]) {
            hero.position.x -= heroSpeed; 
        }
    });
    
});


window.addEventListener("resize", function () {
    engine.resize();
});

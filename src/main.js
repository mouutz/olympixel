var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var hero; 

const createScene = async function () {
    var scene = new BABYLON.Scene(engine);
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0); // Gravité de la scène
    
    // Création du personnage (héros)
    hero = BABYLON.MeshBuilder.CreateSphere("hero", {diameter: 2}, scene);
    hero.position = new BABYLON.Vector3(28, 1.5, 3.5);
    hero.checkCollisions = true;
    hero.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    hero.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);
    
    // Configuration de la caméra
    var camera = new BABYLON.FollowCamera("followCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.lockedTarget = hero;
    camera.heightOffset = 25; 
    camera.radius = 50; 
    camera.rotationOffset = 0; 
    camera.cameraAcceleration = 0.05; 
    camera.maxCameraSpeed = 20; 
    camera.checkCollisions = true;
    camera.applyGravity = true;
    scene.activeCamera.attachControl(canvas, true);

    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
    camera.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);

    // Configuration de la lumière
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.3; 

    // Chargement de la scène (ville) et activation des collisions
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "assets/models/", "polycity2.glb", scene);
    result.meshes.forEach(mesh => {
        mesh.checkCollisions = true;
        console.log(mesh.name)
    });

    // Gestion des entrées clavier
    var inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = true;
    }));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key] = false;
    }));


    engine.runRenderLoop(function () {
        if (scene.activeCamera) {
            scene.render();
        }

        // Vitesse du personnage
        var heroSpeed = 0.5;

        // Calcul du déplacement relatif à la caméra
        var forward = camera.getForwardRay().direction;
        var right = BABYLON.Vector3.Cross(forward, new BABYLON.Vector3(0, 1, 0));

        var forwardDelta = forward.scaleInPlace((inputMap["z"] || inputMap["Z"] ? heroSpeed : 0) - (inputMap["s"] || inputMap["S"] ? heroSpeed : 0));
        var rightDelta = right.scaleInPlace((inputMap["q"] || inputMap["Q"] ? heroSpeed : 0) - (inputMap["d"] || inputMap["D"] ? heroSpeed : 0));

        var deltaMove = forwardDelta.addInPlace(rightDelta);

        // Appliquer le déplacement relatif
        hero.moveWithCollisions(deltaMove);

        // Ajustement de la hauteur avec un raycast (comme avant)
        var ray = new BABYLON.Ray(hero.position, new BABYLON.Vector3(0, -1, 0));
        var pickInfo = scene.pickWithRay(ray, function (item) {
            return item != hero;
        });
        if (pickInfo.pickedMesh) {
            var groundPosition = pickInfo.pickedPoint;
            hero.position.y = groundPosition.y + 1.5;
        }
    });

    
    return scene;
};

createScene().then(function (createdScene) {
    // Débogueur désactivé pour l'instant
});

window.addEventListener("resize", function () {
    engine.resize();
});

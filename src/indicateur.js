function createIndicateur(scene, hero) {
    var arrow = new BABYLON.TransformNode("arrow", scene);

    // Créer la pointe de la flèche
    var cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
        diameterTop: 0,
        height: 0.75,
        diameterBottom: 0.675,
        tessellation: 8
    }, scene);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.z += 1;

    // Créer la tige de la flèche
    var line = BABYLON.MeshBuilder.CreateCylinder("line", {
        diameterTop: 0.3,
        height: 1.2,
        diameterBottom: 0.06,
        tessellation: 8
    }, scene);
    line.rotation.x = Math.PI / 2;
    line.position.z += 0.275 / 2;

    // Matériau pour la flèche
    var materialFlèche = new BABYLON.StandardMaterial("matFlèche", scene);
    cylinder.material = materialFlèche;
    line.material = materialFlèche;

    // Attacher les éléments à l'arrow
    cylinder.parent = arrow;
    line.parent = arrow;

    //scale
    arrow.scaling = new BABYLON.Vector3(0.4, 0.4, 0.4);

    // Position initiale de la flèche
    arrow.position = new BABYLON.Vector3(hero.getAbsolutePosition().x, hero.getAbsolutePosition().y + 2, hero.getAbsolutePosition().z);

    // Objectif initial
    var objectif = new BABYLON.Vector3(0, 0, 0);

    // Fonction pour orienter la flèche vers l'objectif
    scene.onBeforeRenderObservable.add(() => {
        arrow.position = new BABYLON.Vector3(hero.getAbsolutePosition().x, hero.getAbsolutePosition().y + 2, hero.getAbsolutePosition().z);
        updateArrowColor(cylinder,line, objectif, arrow.position);
        arrow.lookAt(objectif);
    });

    // Fonction pour changer la cible
    arrow.setTarget = function (newTarget) {
        objectif = newTarget;
    };

    return arrow;
}


function updateArrowColor(cylinder, line, targetPosition, arrowPosition) {
    var distance = BABYLON.Vector3.Distance(arrowPosition, targetPosition);
    if (distance > 80) {
        var color = new BABYLON.Color3(1, 0, 0); 
        cylinder.isVisible = true;
        line.isVisible = true;
    } else if (distance > 22) {
        var color = new BABYLON.Color3(1, 0.647, 0); 
        cylinder.isVisible = true;
        line.isVisible = true;
    } else {
        cylinder.isVisible = false;
        line.isVisible = false;
        return; 
    }
    cylinder.material.diffuseColor = color;
    line.material.diffuseColor = color;
}

function createCarIndicator(scene, car) {
    // Créer une flèche
    var arrow = BABYLON.MeshBuilder.CreateCylinder("indicator", { diameterTop: 0, diameterBottom: 1, height: 1, tessellation: 5 }, scene);
    arrow.rotation.z = Math.PI 

    var material = new BABYLON.StandardMaterial("indicatorMaterial", scene);
    //coueluir jeune 
    material.diffuseColor = new BABYLON.Color3(1, 0, 0)
    arrow.material = material;

    // Ajouter une animation pour le mouvement de la flèche
    var animation = new BABYLON.Animation("arrowAnimation", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    var keys = [];
    keys.push({ frame: 0, value: 5 }); // Position de départ
    keys.push({ frame: 30, value: 4 }); // Position d'arrivée après 1 seconde
    keys.push({ frame: 60, value: 5 }); // Retour à la position de départ

    animation.setKeys(keys);
    arrow.animations = [animation];

    scene.beginAnimation(arrow, 0, 60, true); // Démarrer l'animation en boucle

    // Mettre à jour la position de la flèche pour qu'elle suive la voiture
    scene.onBeforeRenderObservable.add(() => {
        if (car && car.carHitbox) {
            arrow.position.x = car.carHitbox.position.x;
            arrow.position.z = car.carHitbox.position.z;
            // Ajuster la hauteur de la flèche pour qu'elle soit visible au-dessus de la voiture
        }
    });

    return arrow;
}


export { createIndicateur,createCarIndicator };

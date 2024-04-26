export class GameAudioManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
  }

  loadSounds() {
    // Sons pour les déplacements à pied
    this.sounds.run = new BABYLON.Sound(
      "run",
      "assets/audio/footsteps.wav",
      this.scene,
      () => {},
      { loop: true, autoplay: false }
    );

    this.sounds.jump = new BABYLON.Sound(
      "jump",
      "assets/audio/jump.mp3",
      this.scene,
      () => {},
      { loop: false, autoplay: false }
    );

    // Sons pour l'environnement
    this.sounds.river = new BABYLON.Sound(
      "river",
      "assets/audio/beach.mp3",
      this.scene,
      () => {},
      {
        loop: true,
        autoplay: true,
        spatialSound: true,
        maxDistance: 100,
        rolloffFactor: 15,
        refDistance: 35,
      }
    );
    this.sounds.river.setVolume(0.1);

    this.sounds.city = new BABYLON.Sound(
      "city",
      "assets/audio/city.mp3",
      this.scene,
      () => {},
      {
        loop: true,
        autoplay: true,
        spatialSound: true,
        maxDistance: 250,
        rolloffFactor: 15,
        refDistance: 120,
      }
    );
    this.sounds.city.setVolume(0.1);

    this.sounds.ambulance = new BABYLON.Sound(
      "ambulance",
      "assets/audio/ambulance.mp3",
      this.scene,
      () => {},
      {
        loop: true,
        autoplay: true,
        spatialSound: true,
        maxDistance: 105,
        rolloffFactor: 15,
        refDistance: 30,
      }
    );
    this.sounds.ambulance.setVolume(0.2);

    // sonns pour la voiture
    this.sounds.drive1 = new BABYLON.Sound(
      "drive1",
      "assets/audio/car_drive3.mp3",
      this.scene,
      () => {},
      {
        loop: true,
        autoplay: false,
        maxDistance: 100,
        distanceModel: "exponential",
        spatialSound: true,
        refDistance: 100,
      }
    );
    this.sounds.drive1.setVolume(0.1);

    this.sounds.drive0 = new BABYLON.Sound(
      "drive1",
      "assets/audio/car_drive0.wav",
      this.scene,
      () => {},
      {
        loop: true,
        autoplay: false,
        maxDistance: 100,
        distanceModel: "exponential",
        spatialSound: true,
        refDistance: 100,
      }
    );
    this.sounds.drive0.setVolume(0.1);

    this.sounds.caridle = new BABYLON.Sound(
      "caridle",
      "assets/audio/car_idle.wav",
      this.scene,
      () => {},
      {
        loop: true,
        autoplay: false,
        maxDistance: 100,
        distanceModel: "exponential",
        spatialSound: true,
        refDistance: 100,
      }
    );
    this.sounds.caridle.setVolume(0.1);

    this.attachSoundsToMesh();
  }

  playSound(name, isDriving = false) {
    if(!isDriving){
      this.sounds[name].updateOptions({ maxDistance: 17, refDistance: 8, rolloffFactor : 1});
    }
    else {
      this.sounds[name].updateOptions({ maxDistance: 150, refDistance: 150, rolloffFactor : 1});
    }
    if (this.sounds[name] && !this.sounds[name].isPlaying) {
      //baiiser le volum de tout les sons de la voiture uniquement
      if (
        name === "drive1" ||
        name === "drive0" ||
        name === "caridle" ) {
          if(!isDriving){
            this.sounds[name].setVolume(0.3);
          }
         else {
          this.sounds[name].setVolume(0.5);
        } 
      } else if (name === "beach") {
        this.sounds[name].setVolume(0.1);
      } else {
        this.sounds[name].setVolume(0.7);
      }

      this.sounds[name].play();
    }
  }

  stopSound(name) {
    if (this.sounds[name] && this.sounds[name].isPlaying) {
      this.sounds[name].stop();
    }
  }

  attachSoundsToMesh() {
    const river = this.scene.getMeshByName("Bridge_Tile_1.001");
    const yacht = this.scene.getMeshByName("Yacht_1");
    const yacht2 = this.scene.getMeshByName("Yacht_2");
    const boat2 = this.scene.getMeshByName("Boat_2__1_");
    const ambulance = this.scene.getMeshByName("Ambulance_1__2_");
    const postBox = this.scene.getMeshByName("Post_box_1");

    this.sounds.river.attachToMesh(river);
    this.sounds.ambulance.attachToMesh(ambulance);

  }
}

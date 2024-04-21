export class GameAudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
    }

    loadSounds() {
        // Sons pour les déplacements à pied
        this.sounds.run = new BABYLON.Sound("run", "assets/audio/footsteps.wav", this.scene, () => {}, { loop: true, autoplay: false });

        this.sounds.jump = new BABYLON.Sound("jump", "assets/audio/jump.mp3", this.scene, () => {
            
        }, { loop: false, autoplay: false });


        // Sons pour l'environnement
        this.sounds.river = new BABYLON.Sound("river", "assets/audio/beach.mp3", this.scene, () => {
            
        }, { loop: true, autoplay: false });


        // sonns pour la voiture
        this.sounds.drive1 = new BABYLON.Sound("drive1", "assets/audio/car_drive3.mp3", this.scene, () => {
            
        }, { loop: true, autoplay: false });
        this.sounds.drive0 = new BABYLON.Sound("drive1", "assets/audio/car_drive0.wav", this.scene, () => {
            
        }, { loop: true, autoplay: false });
        this.sounds.caridle = new BABYLON.Sound("caridle", "assets/audio/car_idle.wav", this.scene, () => {
            
        }, { loop: true, autoplay: false });
    }

    playSound(name) {
        if (this.sounds[name] && !this.sounds[name].isPlaying) {
            //baiiser le volum de tout les sons de la voiture uniquement
            if(name === "drive1" || name === "drive0" || name === "caridle" || name === "jump"){
                this.sounds[name].setVolume(0.05);
            }else if(name === "beach"){
                this.sounds[name].setVolume(0.1);
            }
            else{
                this.sounds[name].setVolume(0.1);
            }
            
            
            this.sounds[name].play();
            
            console.log("Playing sound:", name);
        }
    }

    stopSound(name) {
        if (this.sounds[name] && this.sounds[name].isPlaying) {
            this.sounds[name].stop();
            console.log("Stopped sound:", name);
        }
    }
}

export class GUIManager {
  constructor(scene) {
      this.scene = scene;
      this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
      this._isReading = false;
  }

  get isReading() {
    return this._isReading;
}


set isReading(value) {
    this._isReading = value;
}

  createNotif(str="Appuyez sur 'E' pour interagir") {
      var rect = new BABYLON.GUI.Rectangle();
      rect.width = 0.3;
      rect.height = "60px";
      rect.cornerRadius = 5;
      rect.color = "white";
      rect.thickness = 1;
      rect.background = "black";
      rect.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      rect.top = "-40px";
      this.advancedTexture.addControl(rect);

      var text1 = new BABYLON.GUI.TextBlock();
      text1.text = str;
      text1.color = "white";
      text1.textWrapping = true;
      text1.resizeToFit = true;
      text1.fontSize = 24;
      rect.addControl(text1);

      rect.isVisible = false;
      return rect;
  }

  setNotif(notification, isVisible, message = "Appuyez sur 'E' pour interagir") {
    notification.children[0].text = message;
    notification.isVisible = isVisible;
}

  showLetter(text) {
    if (this._isReading) return;
    this._isReading = true;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

      const letterPanel = new BABYLON.GUI.Rectangle();
      letterPanel.width = screenWidth > 1300 ? "50%" : "70%";
      letterPanel.height = screenHeight > 800 ? "80%" : "90%";
      letterPanel.cornerRadius = 20;
      letterPanel.color = "black";
      letterPanel.thickness = 2;
      letterPanel.background = "white";
      this.advancedTexture.addControl(letterPanel);

      const textBlock = new BABYLON.GUI.TextBlock();
      textBlock.text = `Cher Héros,

      Nous avons des informations cruciales concernant la mission qui t'attend. 
      D'après nos sources, la flamme olympique a été cachée dans une pièce secrète. 
      Apparemment, le portail pour accéder à cette pièce secrète se trouve dans 
      l'une des nouvelles statues des JO 2024, située à "la place".
      
      Cependant, pour accéder à la pièce secrète, 
      tu devras avoir en ta possession les cinq anneaux des Jeux Olympiques. 
      Selon nos renseignements, les anneaux sont dissimulés un peu partout dans Paris.
      
      Nous savons qu'un coffre contenant le premier anneau se trouve dans un parc. 
      Pour les autres anneaux, tu devras explorer la ville pour les trouver.
      
      Une fois que tu auras tous les anneaux, 
      tu pourras accéder à la pièce secrète où la flamme olympique est cachée.
      
      Bonne chance et que l'esprit des Jeux Olympiques te guide!`;
      textBlock.color = "black";
      textBlock.fontSize = screenWidth > 800 ? "20px" : "16px";
      textBlock.textWrapping = true;
      textBlock.resizeToFit = true;
      letterPanel.addControl(textBlock);

      const closeButton = BABYLON.GUI.Button.CreateSimpleButton("closeButton", "Fermer");
      closeButton.width = screenWidth > 800 ? "20%" : "30%";
      closeButton.height = "40px";
      closeButton.color = "white";
      closeButton.cornerRadius = 20;
      closeButton.background = "black";
      closeButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
      closeButton.top = "-20px";
      letterPanel.addControl(closeButton);

      this.scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
          letterPanel.isVisible = false;
          //dispose of the letter panel
          letterPanel.dispose();
          this._isReading = false;
          

        }
      });

      return letterPanel;
  }

  showCommandsLetter() {
    if (this.commandsPanel) {
      this.commandsPanel.dispose();
      this.commandsPanel = null;
      this._isReading = false;
      return;
    }

    const commandsText = `
      Commandes du jeu :
      
      - Z (W) : Avancer
      - S : Reculer
      - Q (A) : Tourner à gauche
      - D : Tourner à droite
      - E : Interagir
      - Espace : Sauter
      - O : Afficher / Cacher  l'indicateur 
      - M : Agrandir/Réduire la minimap
      - I : Afficher cette aide
      - B+N : teleportation si vous etes bloqué
    `;

    this._isReading = true;
    this.commandsPanel = new BABYLON.GUI.Rectangle();
    this.commandsPanel.width = 0.5;
    this.commandsPanel.height = 0.75;
    this.commandsPanel.cornerRadius = 20;
    this.commandsPanel.color = "black";
    this.commandsPanel.thickness = 2;
    this.commandsPanel.background = "white";
    this.advancedTexture.addControl(this.commandsPanel);

    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = commandsText;
    textBlock.color = "black";
    textBlock.fontSize = 24;
    textBlock.textWrapping = true;
    textBlock.resizeToFit = true;
    this.commandsPanel.addControl(textBlock);

   

   

  }

  
}

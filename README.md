# OLYMPIXEL

Bienvenue dans Paris, la ville de l'amour, de l'art et maintenant des Jeux Olympiques de 2024 ! Préparez-vous à une aventure palpitante où vous incarnez un héros appelé à l'aide par la mairie de Paris pour restaurer l'ordre dans la ville.

## Contexte :

Le jeu se déroule à Paris, où une agitation étudiante secoue la ville ! Les jeunes parisiens sont furieux que le gouvernement ait réquisitionné les logements du CROUS pour les Jeux Olympiques de 2024. Dans un geste de protestation audacieux, certains étudiants ont décidé de prendre les choses en main en dérobant les précieux anneaux olympiques et la flamme sacrée des JO.

Votre mission, en tant que joueur, est d'aider la mairie de Paris à rétablir l'ordre dans la ville. Tout commence par un appel urgent vous invitant à vous rendre au commissariat de police pour récupérer une lettre importante. Mais attention, ce n'est que le début de votre aventure mouvementée !

Vous aurez à votre disposition une voiture pour vous déplacer rapidement dans les rues animées de Paris. Votre objectif ultime : retrouver tous les anneaux éparpillés dans la ville ainsi que la flamme des Jeux Olympiques. Heureusement, une flèche surplombera votre personnage pour vous guider tout au long de votre quête. Cette flèche magique vous indiquera la direction des anneaux non récupérés : rouge pour les objectifs lointains, orange pour les plus proches, et elle disparaîtra lorsque vous serez tout près de votre objectif.

## Le But du Jeu :

Votre mission est claire : retrouver tous les anneaux disséminés dans les rues de Paris et ramener la flamme olympique à sa place légitime. Mais attention aux embûches et aux défis qui se dresseront sur votre chemin ! Avec votre voiture pour vous aider à vous déplacer rapidement et la flèche magique pour vous guider, vous êtes le seul espoir de restaurer la paix dans la ville.

Prêt à relever ce défi épique ? Alors préparez-vous à plonger au cœur de l'action et à vivre une aventure inoubliable dans les rues ensoleillées de Paris !


## Commandes

- **Z** || **W** : Avancer
- **S** : Reculer
- **Q** || **A** : Aller à gauche
- **D** : Aller à droite
- **Barre d'Espace** : Sauter
- **E** : Interagir
- **B + N** : Téléporter le joueur dans une zone aléatoire (à utiliser lorsque le joueur est bloqué entre des collisions)
- **I** : Afficher les Commandes
- **M** : Ouvrir/fermer la carte. (vous êtes entouré en rouge dessus pour vous reperer plus facilement)


## Démo

Découvrez le gameplay et l'atmosphère de Olympixel dans notre vidéo de démonstration disponible sur [https://www.youtube.com/watch?v=D-PhccMq3rA](https://www.youtube.com/watch?v=D-PhccMq3rA)


## Solutions tester en ligne 
***Utiliser de préférence le navigateur Chrome ou tout navigateur basé sur Chromium***
[https://www.minuteanime.com/play/olympixel/](https://www.minuteanime.com/play/olympixel/).

## Solutions

Consultez cette section pour des conseils, des astuces et des captures d'écran pour vous aider à retrouver les anneaux olympiques plus rapidement !

###Normalement, vous n'aurez pas besoin des solutions pour trouver les anneaux puisque dans le jeu, il y a une flèche qui va vous guider et qui va disparaître quand vous êtes à 25 mètres de l'objectif.
Cependant, si vous avez du mal à retrouver les anneaux, vous pouvez consulter les solutions en images ci-dessous :

>! ATTTENTION SPOILER
>![anneaux ](https://hlsplay.tk/olympixel/images/solution2.png)
>![anneaux ](https://hlsplay.tk/olympixel/images/solution5.png)
>![anneaux ](https://hlsplay.tk/olympixel/images/solution4.png)
>![anneaux ](https://hlsplay.tk/olympixel/images/solution3.png)
>![anneaux ](https://hlsplay.tk/olympixel/images/solution%20.png)
>![maze](https://hlsplay.tk/olympixel/images/map%20ilmustration4%20.png)
>![maze](https://hlsplay.tk/olympixel/images/maze%20solution.png)

## Options Graphiques Disponibles

- **High** : Plus de bâtiments et meilleure qualité, avec plus de détails.
- **Low** : Mode optimisé avec une map moins detailé , recommandé en cas de problème de performance.

## Performances

### Optimisation des Performances

Pour améliorer les performances du jeu, plusieurs optimisations ont été mises en place par rapport à la première version. Voici un aperçu des principales stratégies employées :

1. **Utilisation de Modèles Low Poly :**
   - Notre jeu utilise exclusivement des modèles low poly. Cela signifie que chaque objet 3D est composé d'un nombre minimal de polygones, ce qui réduit la complexité des calculs nécessaires pour le rendu.
   - **Avantage :** Les modèles low poly nécessitent moins de ressources pour être rendus, ce qui permet au jeu de fonctionner de manière fluide même sur des machines moins puissantes.

   ![Low Poly Model Example](https://hlsplay.tk/olympixel/images/map%20ilmustration5%20.png)
   ![Low Poly Model Example](https://hlsplay.tk/olympixel/images/map%20ilmustration4%20.png)
   
   
3. **Regroupement des Objets dans Blender :**
   - Une des astuces qui nous a énormément aidés a été le regroupement des objets dans Blender. Plutôt que de laisser chaque petit objet séparé, nous avons regroupé plusieurs objets en un seul. Par exemple, une place entière composée de nombreux petits objets a été regroupée en un seul objet.
   - **Avantage :** Réduction significative du nombre de calculs nécessaires pour le rendu, ce qui améliore les performances globales.
   - **Limite :** Cette astuce ne doit pas être utilisée de manière excessive. Si nous regroupions toute la carte en un seul objet, cela provoquerait des problèmes de performances majeurs car cela entraînerait un énorme nombre de calculs. De plus, le chargement de toute la carte en une seule fois irait à l'encontre de notre stratégie de chargement dynamique.
  
        ![Grouped Objects Example](https://hlsplay.tk/olympixel/images/optimistaion1.png)
        ![Grouped Objects Example](https://hlsplay.tk/olympixel/images/optimistaion3.png)
        ![Grouped Objects Example](https://hlsplay.tk/olympixel/images/optimistaion2.png)
        ![Grouped Objects Example](https://hlsplay.tk/olympixel/images/optimistaion4.png)


4. **Optimisation des Textures :**
   - Les textures ont été optimisées pour réduire leur taille sans sacrifier la qualité visuelle. Cela inclut la réduction de la résolution des textures et l'utilisation de formats de compression efficaces.
   - **Avantage :** Réduction de l'utilisation de la mémoire et des temps de chargement des textures, ce qui améliore les performances.

5. **Gestion Efficace des Lumières :**
   - Le nombre de sources lumineuses actives a été optimisé. Nous avons réduit le nombre de lumières dynamiques et utilisé des lumières statiques lorsque cela était possible.
   - **Avantage :** Réduction de la charge de calcul pour le rendu des lumières, ce qui améliore les performances globales.

6. **Animations Optimisées :**
   - Les animations ont été optimisées pour être moins gourmandes en ressources, en ajustant les interpolations et en réduisant le nombre de clés d'animation.
   - **Avantage :** Réduction de l'utilisation de la CPU et de la mémoire pour les animations, ce qui améliore les performances.

7. **Deux Versions de la Carte :**
   - Nous avons créé deux versions de la carte du jeu : une version détaillée avec de nombreux objets et une version simplifiée avec beaucoup moins d'objets.
   - **Avantage :** La version simplifiée permet aux joueurs ayant des machines moins puissantes de profiter d'une expérience de jeu fluide, tandis que la version détaillée offre une immersion plus riche pour ceux disposant de configurations plus robustes.

**Hight Quality Map :**
![map](https://hlsplay.tk/olympixel/images/map2.png)
![map](https://hlsplay.tk/olympixel/images/heigh%20map.png)
**Low Quality Map :**
![map](https://hlsplay.tk/olympixel/images/map3.png)
![map](https://hlsplay.tk/olympixel/images/low%20map1.png)

## Auteurs

- **Ayoub Admessiev** - Étudiant en Master 2 MBDS MIAGE
- **Mootez Sahli** - Étudiant en Master 2 IA MIAGE
    
L'année précédente, nous avons déjà participé et avons obtenu la 10ème place avec notre jeu SaveIt! On revien cette année pour obtenir une meilleur place ! :)

## Conseils

- Jouez avec un casque ou des écouteurs pour une expérience immersive.
- Prenez le temps d'explorer chaque recoin de Paris.
- N'oubliez pas de vous amuser et de profiter de cette aventure unique !


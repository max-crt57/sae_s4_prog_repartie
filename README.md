# SAE S4 - Programmation Répartie

## Groupe
- BOULANGER Néo
- CLAUDE Nicolas
- CRAINCOURT Maxime
- PIQUAND Maël

## Lancer le projet

> **Prérequis** : Java 17+ et Maven installés.

Ouvrir **2 terminaux** depuis la racine du projet et lancer les commandes **dans cet ordre** :

### 1. Serveur RMI (terminal 1)

```bash
mvn clean install
mvn exec:java
```

Le serveur affiche `Service Restaurant pret.` et reste actif. **Ne pas fermer ce terminal.**

### 2. Proxy Java (terminal 2)

```bash
mvn clean compile 
mvn exec:java
```

Le proxy se lance sur `http://localhost:8080`.

### Arrêter les serveurs

`Ctrl+C` dans chaque terminal.
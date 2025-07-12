# 🎤 Vled Audio Transcriptor

Bienvenue sur Vled Audio Transcriptor, une application web intelligente pour la transcription et le résumé de fichiers audio, propulsée par l'API Gemini de Google.

Cette application s'exécute entièrement dans le navigateur et requiert une clé API Google Gemini pour fonctionner.

## Comment ça marche ?

L'application offre deux manières de gérer la clé API :

1.  **Saisie manuelle (par défaut) :** Au premier lancement, l'application vous demandera votre clé API Gemini. Cette clé est stockée de manière sécurisée dans la **session de votre navigateur** et n'est jamais envoyée ou partagée ailleurs. Elle est conservée tant que votre onglet de navigateur est ouvert.
2.  **Configuration par l'administrateur :** Pour un déploiement public (par exemple, sur GitHub Pages), le propriétaire du site peut pré-configurer une clé API via des variables d'environnement. Dans ce cas, les utilisateurs finaux n'auront pas besoin de fournir leur propre clé.

## Comment lancer le projet localement

**Important :** Vous ne pouvez pas simplement ouvrir le fichier `index.html` directement dans votre navigateur (via le protocole `file://`). Vous devez servir l'application via un serveur web local.

### 1. Avec Python (si vous avez Python installé)

Ouvrez un terminal dans le dossier du projet et lancez :

```bash
# Pour Python 3
python -m http.server
```
Ensuite, ouvrez votre navigateur à l'adresse : [http://localhost:8000](http://localhost:8000)

### 2. Avec Node.js (si vous avez Node.js et npm installés)

Ouvrez un terminal dans le dossier du projet et lancez :

```bash
npx http-server
```
Ensuite, ouvrez votre navigateur à l'adresse indiquée (généralement [http://localhost:8080](http://localhost:8080)).

Une fois le serveur lancé, l'application vous demandera votre clé API si aucune n'est configurée.

---

## Configuration pour le déploiement (ex: GitHub Pages)

Pour simplifier l'expérience des visiteurs de votre site, vous pouvez configurer votre propre clé API pour qu'elle soit utilisée par tous.

1.  **Obtenez votre Clé API Gemini :**
    *   Rendez-vous sur [Google AI Studio](https://aistudio.google.com/app/apikey) et créez votre clé API.

2.  **Configurez un "Secret" sur GitHub :**
    *   Dans votre dépôt GitHub, allez dans `Settings` > `Secrets and variables` > `Actions`.
    *   Créez un nouveau "repository secret" avec le nom `API_KEY`.
    *   Collez votre clé API Gemini comme valeur pour ce secret.

3.  **Utilisez le Secret dans votre Workflow GitHub Actions :**
    *   Pour que `process.env.API_KEY` soit accessible dans votre code JavaScript, vous devez utiliser un outil de build (comme Vite, Webpack, etc.) qui peut remplacer cette variable par la valeur du secret au moment de la construction du site. L'application est conçue pour détecter et utiliser cette clé si elle est présente.

Si la clé est fournie via ce mécanisme, les utilisateurs ne verront pas la fenêtre de demande de clé API.
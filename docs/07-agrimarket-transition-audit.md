# Audit de transition — AgriMarket

## 1) État actuel du projet

Le dépôt actuel est une marketplace e-commerce de cosmétiques de luxe nommée ITEXAL Beauty, conçue pour le marché camerounais. Le code est fonctionnel, l’interface est complète et le projet est bien structuré pour un store e-commerce classique.

Il repose sur :
- Next.js 16 App Router
- React 19
- CSS personnalisé / design luxury
- StoreContext local + `db.json`
- routes App Router pour le site public et l’admin
- PWA, notifications, panier, commandes, profil, blog, catalogue, etc.

## 2) Ce qui est déjà utile pour AgriMarket

Les éléments vraiment réutilisables sans refonte majeure sont :

- La structure générale d’une marketplace : catalogue, fiche produit, panier, commandes, profil, notifications, FAQ, contact.
- La base technique Next.js + App Router : fiable et adaptée pour le MVP.
- La logique de navigation et des pages publiques.
- Le système de store local / contexte React exploitable comme base de prototype.
- La séparation entre site public et panneau admin.
- Les modules de sécurité de base, routage, compte utilisateur et flux de commande.

## 3) Ce qui est incompatible avec AgriMarket en l’état

Le projet actuel est fortement orienté beauté / cosmétique, avec :

- un branding ITEXAL Beauty
- des catégories : maquillage, soins, parfums, capillaire
- du contenu purement cosmétique
- des libellés, images, blog et marques alignés sur le monde de la beauté
- des produits et données non adaptés à l’agriculture, l’élevage, l’intrant, la volaille, la pisciculture, la logistique agricole, etc.

Ces éléments ne doivent pas être supprimés à la légère dans cette phase, car ils constituent déjà une base UI / e-commerce fonctionnelle. Mais ils ne correspondent pas au produit AgriMarket.

## 4) Analyse de l’architecture

### Frontend
Le site est construit avec App Router, pages et composants React. L’UI est fortement stylée et adaptée à un e-commerce premium.

### Données
Les données de production de prototype sont stockées dans `db.json` et rechargées dans le contexte `lib/context/StoreContext.jsx`.

### État global
Le `StoreProvider` gère :
- produits
- panier
- wishlist
- commandes
- notifications
- utilisateurs
- adresses
- avis
- demande produit
- historique de navigation

### Routes
Le projet couvre un catalogue complet de boutique et des composants de profil, commandes, admin et blog. Cela offre une bonne base fonctionnelle pour une marketplace plus large.

## 5) Ce qui est à conserver, adapter ou ignorer

### À conserver
- `app/` : structure de pages
- `composants/` : composants partagés
- `lib/context/StoreContext.jsx` : base de logique globale
- `db.json` : source de données de prototype
- `middleware.js` : logique de protection de routes utile à adapter
- `public/` : assets et PWA
- `styles/` : système visuel existant, sans refonte pour cette étape

### À adapter plus tard
- Les catégories et libellés du catalogue
- La plateforme de données produit (nom, unité, stock, description métier agricole)
- Les pages d’accueil, catalogues, marques, promos, blog, etc.
- Les modules pour l’administration du catalogue / vendeurs / commandes

### À ignorer pour le moment
- Les suppressions agressives ou les refontes graphiques
- Les changements de design ou de navigation visuelle
- Les nettoyages destructifs qui ne sont pas explicitement nécessaires

## 6) Décision prudente pour cette première phase

Au vu du cahier de charges AgriMarket, il serait risqué de transformer directement le projet en marketplace agricole sans une préparation structurée.

La bonne approche pour cette étape est donc :
1. préserver le projet fonctionnel actuel,
2. documenter la migration,
3. éviter les modifications visuelles,
4. préparer un socle technique propre et réutilisable,
5. lancer la migration métier dans des étapes ultérieures.

## 7) Règles appliquées dans cette phase

- aucun changement visuel
- aucune refonte de design
- aucune suppression de composants sans preuve d’inutilité explicite
- aucun remplacement de code fonctionnel par du faux
- conservation stricte de la base actuelle

## 8) Vérification technique

Le projet a été compilé avec succès via :

```bash
npm run build
```

Résultat : build OK, ce qui confirme que la base est stable et exploitable pour une préparation progressive vers AgriMarket.

## 9) Conclusion

Le projet actuel est une base e-commerce solide et fonctionnelle, mais il est clairement orienté ITEXAL Beauty et ne correspond pas encore au périmètre AgriMarket.

La bonne stratégie est de garder cette base intacte, la documenter et la préparer progressivement, sans perturber l’interface actuelle. La migration métier réelle vers AgriMarket devra se faire à travers des étapes ciblées de contenu, modèles de données, catégories, rôle vendeur / acheteur, logistique, produits agricoles et modules de vente rurale.

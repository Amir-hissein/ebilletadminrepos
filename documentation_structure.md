# STRUCTURE DES DONNÉES E-BILLET TCHAD
## Documentation des Relations et Hiérarchie

---

## 1. HIÉRARCHIE DES UTILISATEURS

```
SUPER ADMIN (niveau 1)
    │
    ├─── SOUS-ADMIN AGENCES (niveau 2)
    │    └─── Gère l'intégration et le suivi des agences
    │
    ├─── SOUS-ADMIN FINANCE (niveau 2)
    │    └─── Gère paiements, commissions, rapports
    │
    ├─── SOUS-ADMIN OPÉRATIONS (niveau 2)
    │    └─── Gère le suivi des voyages
    │
    ├─── SOUS-ADMIN SUPPORT (niveau 2)
    │    └─── Gère plaintes et litiges
    │
    └─── AGENCES
         │
         ├─── ADMIN AGENCE (niveau 3)
         │    └─── Gère les agents, voyages, réservations de son agence
         │
         └─── AGENT AGENCE (niveau 4)
              └─── Vend des billets, confirme paiements
```

---

## 2. TABLES PRINCIPALES ET LEURS RELATIONS

### A. GESTION DES UTILISATEURS

**TABLE: `roles`**
- Définit les 7 types de rôles dans le système
- Chaque rôle a un niveau d'accès (1 à 4)

**TABLE: `utilisateurs`**
- Contient TOUS les utilisateurs (Super Admin → Agents)
- Relations:
  - `role_id` → roles.id (type d'utilisateur)
  - `agence_id` → agences.id (NULL pour Super Admin et Sous-Admins)
  - `created_by` → utilisateurs.id (qui a créé cet utilisateur)

**TABLE: `types_sous_admin`**
- 4 types: AGENCES, FINANCE, OPERATIONS, SUPPORT

**TABLE: `utilisateur_sous_admin`**
- Liaison entre un utilisateur Sous-Admin et son type
- Un Sous-Admin peut avoir plusieurs spécialités

### B. GESTION DES AGENCES

**TABLE: `agences`**
- Chaque agence est une entité indépendante
- Relations:
  - `created_by` → utilisateurs.id (qui a créé l'agence)
  - `validated_by` → utilisateurs.id (Super Admin qui a validé)
- Types: bus, avion, mixte
- Statuts: active, suspendue, fermée

### C. GESTION DES VOYAGES

**TABLE: `villes`**
- Liste des villes du Tchad

**TABLE: `voyages`**
- Créés par Admin Agence ou Agent
- Relations:
  - `agence_id` → agences.id
  - `ville_depart_id` → villes.id
  - `ville_arrivee_id` → villes.id
  - `created_by` → utilisateurs.id
  - `validated_by` → utilisateurs.id (si validation Super Admin requise)

### D. GESTION DES RÉSERVATIONS

**TABLE: `clients`**
- Informations des clients finaux

**TABLE: `reservations`**
- Le cœur du système de billetterie
- Relations:
  - `voyage_id` → voyages.id
  - `client_id` → clients.id
  - `agence_id` → agences.id
  - `agent_id` → utilisateurs.id (l'agent qui a vendu)
- Génère un numéro unique et QR code

### E. SYSTÈME DE VALIDATION

**TABLE: `actions_critiques`**
- Toutes les actions nécessitant validation Super Admin
- Types d'actions:
  - Bloquer/Supprimer agence
  - Supprimer voyage
  - Modifier commission
  - Rembourser client
  - Suspendre utilisateur
- Relations:
  - `demandeur_id` → utilisateurs.id (Sous-Admin)
  - `validateur_id` → utilisateurs.id (Super Admin)
- Statuts: en_attente, validee, rejetee

### F. GESTION FINANCIÈRE

**TABLE: `transactions`**
- Enregistre tous les mouvements financiers
- Types: paiement, remboursement, commission
- Relations:
  - `reservation_id` → reservations.id
- Bénéficiaires: plateforme, agence, client

### G. SUPPORT CLIENT

**TABLE: `plaintes`**
- Gestion des réclamations
- Relations:
  - `reservation_id` → reservations.id
  - `client_id` → clients.id
  - `agence_id` → agences.id
  - `assigne_a` → utilisateurs.id (Admin Support)
  - `validated_by` → utilisateurs.id (Super Admin si critique)

### H. SYSTÈME DE TRAÇABILITÉ

**TABLE: `logs_activite`**
- Enregistre toutes les actions dans le système
- Stocke: utilisateur, action, entité, IP, user agent

**TABLE: `notifications`**
- Messages pour les utilisateurs

**TABLE: `sessions`**
- Gestion des sessions actives

---

## 3. FLUX DE DONNÉES PRINCIPAUX

### FLUX 1: Création d'une agence
```
Super Admin / Sous-Admin Agences
    ↓
INSERT agences (statut: en_attente si validation requise)
    ↓
Super Admin valide → UPDATE agences.validated_by
    ↓
Création Admin Agence → INSERT utilisateurs (agence_id = nouvelle agence)
```

### FLUX 2: Création d'un voyage
```
Admin Agence / Agent Agence
    ↓
INSERT voyages (agence_id, villes, horaires, places)
    ↓
(Optionnel) Super Admin valide pour actions sensibles
```

### FLUX 3: Réservation client
```
Agent Agence recherche voyage disponible
    ↓
Appel procédure: creer_reservation()
    ↓
    1. Vérifie places disponibles
    2. Calcule prix total et commissions
    3. INSERT reservations
    4. UPDATE voyages.places_disponibles
    5. Génère numéro réservation
    ↓
Agent confirme paiement
    ↓
UPDATE reservations.statut_paiement = 'paye'
INSERT transactions
```

### FLUX 4: Action critique
```
Sous-Admin demande action (ex: bloquer agence)
    ↓
INSERT actions_critiques (statut: en_attente)
    ↓
INSERT notifications → Super Admin
    ↓
Super Admin valide ou rejette
    ↓
UPDATE actions_critiques.statut
    ↓
Si validée: exécution de l'action
```

---

## 4. MODÈLE FINANCIER (Calcul automatique)

**Exemple avec prix billet: 20,000 FCFA**

```sql
-- Commission par défaut: 10%
prix_total = prix_unitaire × nombre_places
           = 20,000 × 1 = 20,000 FCFA

commission_plateforme = prix_total × (commission_pourcentage / 100)
                      = 20,000 × 0.10 = 2,000 FCFA

montant_agence = prix_total - commission_plateforme
               = 20,000 - 2,000 = 18,000 FCFA
```

Ces calculs sont automatiques dans la procédure `creer_reservation()`

---

## 5. PERMISSIONS PAR RÔLE

### SUPER ADMIN (niveau 1)
- ✅ Tout créer, modifier, supprimer
- ✅ Créer Sous-Admins et Agences
- ✅ Valider toutes actions critiques
- ✅ Modifier commissions
- ✅ Accès total aux données

### SOUS-ADMIN AGENCES (niveau 2)
- ✅ Créer/modifier agences
- ✅ Consulter toutes agences
- ❌ Supprimer agence (demande validation)
- ✅ Créer Admin Agence

### SOUS-ADMIN FINANCE (niveau 2)
- ✅ Voir toutes transactions
- ✅ Générer rapports financiers
- ❌ Modifier commissions (demande validation)
- ✅ Traiter remboursements avec validation

### SOUS-ADMIN OPÉRATIONS (niveau 2)
- ✅ Consulter tous voyages
- ✅ Voir statistiques
- ❌ Supprimer voyage (demande validation)

### SOUS-ADMIN SUPPORT (niveau 2)
- ✅ Gérer plaintes
- ✅ Assigner plaintes
- ✅ Résoudre litiges simples
- ❌ Litiges critiques (demande validation)

### ADMIN AGENCE (niveau 3)
- ✅ Créer/modifier voyages de son agence
- ✅ Créer agents de son agence
- ✅ Voir réservations de son agence
- ❌ Accès autres agences

### AGENT AGENCE (niveau 4)
- ✅ Vendre billets
- ✅ Confirmer paiements
- ✅ Voir réservations qu'il a créées
- ❌ Modifier voyages
- ❌ Créer autres agents

---

## 6. VUES PRÉDÉFINIES

### `vue_agences_complete`
Affiche agences avec leur admin principal, nombre agents et voyages

### `vue_reservations_complete`
Toutes infos réservation: client, agence, agent, voyage, villes

### `vue_stats_agences`
Statistiques financières par agence:
- Total réservations
- Chiffre d'affaire
- Revenu agence
- Commission plateforme

---

## 7. SÉCURITÉ

### Triggers de protection
- **before_voyage_delete**: Empêche suppression voyage avec réservations
- **after_user_insert**: Log automatique création utilisateur

### Contraintes
- Unicité: emails, téléphones, numéros réservation
- Foreign keys avec CASCADE pour nettoyage auto
- Indexes pour performance des recherches

### Logs
- Toutes actions importantes enregistrées dans `logs_activite`
- IP et User Agent trackés
- Sessions avec expiration

---

## 8. UTILISATION DES DONNÉES

### Créer un Super Admin (premier utilisateur)
```sql
INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, role_id)
VALUES ('Admin', 'Super', 'super@ebillet.td', '+23512345678', 
        '$2y$10$...', -- mot de passe hashé
        1); -- role_id = 1 (Super Admin)
```

### Créer une agence
```sql
INSERT INTO agences (nom, type_service, adresse, ville, telephone, created_by, validated_by, validated_at)
VALUES ('Transport Express', 'bus', 'Avenue Mobutu', 'N\'Djamena', '+23599887766', 
        1, 1, NOW());
```

### Créer un Admin d'agence
```sql
INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, role_id, agence_id, created_by)
VALUES ('Kamougue', 'Jean', 'jean@transportexpress.td', '+23598765432',
        '$2y$10$...', 6, 1, 1);
        -- role_id = 6 (Admin Agence), agence_id = 1, created_by = 1 (Super Admin)
```

### Créer un voyage
```sql
INSERT INTO voyages (agence_id, ville_depart_id, ville_arrivee_id, date_depart, heure_depart,
                    prix_unitaire, places_totales, places_disponibles, type_transport, created_by)
VALUES (1, 1, 2, '2026-02-10', '08:00:00', 20000, 50, 50, 'bus', 2);
-- created_by = 2 (Admin Agence ou Agent)
```

### Créer une réservation (via procédure)
```sql
CALL creer_reservation(
    1,              -- voyage_id
    1,              -- client_id
    3,              -- agent_id
    2,              -- nombre_places
    @numero_res,    -- OUT numero_reservation
    @success,       -- OUT success
    @message        -- OUT message
);

SELECT @numero_res, @success, @message;
```

---

## 9. OPTIMISATIONS

### Index créés pour performance:
- Recherche voyages par date/ville
- Recherche réservations par numéro
- Recherche clients par téléphone
- Fulltext search sur noms d'agences
- Index composites sur requêtes fréquentes

### Procédures stockées:
- `creer_reservation()`: Atomicité garantie pour ventes

### Vues matérialisées possibles (à créer selon besoins):
- Statistiques quotidiennes
- Top agences du mois
- Voyages populaires

---

## 10. EXTENSIONS FUTURES

**Possibilités d'évolution:**
- Table `promotions` pour codes promo
- Table `avis_clients` pour notations
- Table `partenaires` pour Mobile Money
- Table `documents_legaux` pour contrats agences
- Table `vehicules` pour gestion flotte
- Table `sieges` pour sélection de places

**Multi-tenant:**
- Le système est prêt pour gérer plusieurs pays
- Champ `pays` dans table `villes`
- Possibilité d'ajouter `pays_id` dans `agences`


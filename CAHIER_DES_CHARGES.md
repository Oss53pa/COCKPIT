# CAHIER DES CHARGES
## COCKPIT - Plateforme de Pilotage Stratégique pour Centres Commerciaux

**Version :** 1.0
**Date :** 11 janvier 2026
**Statut :** Document de référence

---

## TABLE DES MATIERES

1. [Présentation du Projet](#1-présentation-du-projet)
2. [Contexte et Objectifs](#2-contexte-et-objectifs)
3. [Périmètre Fonctionnel](#3-périmètre-fonctionnel)
4. [Architecture Technique](#4-architecture-technique)
5. [Spécifications Fonctionnelles](#5-spécifications-fonctionnelles)
6. [Modèle de Données](#6-modèle-de-données)
7. [Interface Utilisateur](#7-interface-utilisateur)
8. [Exigences Non Fonctionnelles](#8-exigences-non-fonctionnelles)
9. [Contraintes et Limites](#9-contraintes-et-limites)
10. [Évolutions Prévues](#10-évolutions-prévues)

---

## 1. PRÉSENTATION DU PROJET

### 1.1 Identification

| Élément | Description |
|---------|-------------|
| **Nom du projet** | COCKPIT - Pilotage Stratégique |
| **Type d'application** | Application Web SPA (Single Page Application) |
| **Domaine métier** | Immobilier commercial / Gestion de centres commerciaux |
| **Utilisateurs cibles** | Directeurs, gestionnaires et équipes opérationnelles de centres commerciaux |
| **Réseau concerné** | CRMC (Centres Régionaux Multi-Commerciaux) |

### 1.2 Résumé Exécutif

COCKPIT est une plateforme de pilotage stratégique et d'intelligence décisionnelle de niveau entreprise, conçue pour la gestion multi-sites de centres commerciaux. L'application permet le pilotage stratégique, le suivi opérationnel, la gestion de projets et l'analyse approfondie des données pour les propriétés commerciales.

### 1.3 Périmètre Global

L'application se compose de **trois modules principaux** :

1. **Module Core** - Gestion stratégique et opérationnelle
2. **Module BI** - Business Intelligence et reporting avancé
3. **Module Projet** - Gestion des lancements de nouveaux centres

---

## 2. CONTEXTE ET OBJECTIFS

### 2.1 Contexte Métier

Les centres commerciaux du réseau CRMC nécessitent un outil unifié permettant :

- La centralisation des indicateurs de performance (KPI)
- Le suivi des objectifs stratégiques par axe
- La coordination des équipes et des actions
- L'analyse comparative entre centres
- La gestion des projets de lancement de nouveaux centres
- La production de rapports décisionnels

### 2.2 Objectifs du Projet

#### Objectifs Stratégiques
- Fournir une vision consolidée de la performance du portefeuille
- Permettre un pilotage proactif basé sur des indicateurs temps réel
- Faciliter la prise de décision grâce à l'analyse de données

#### Objectifs Opérationnels
- Automatiser la collecte et le calcul des KPI
- Réduire le temps de production des rapports
- Améliorer la traçabilité des actions et décisions
- Standardiser les processus de gestion entre centres

#### Objectifs Techniques
- Garantir une disponibilité hors ligne (offline-first)
- Assurer une performance optimale même avec de grands volumes de données
- Permettre l'export multi-format des données et rapports

### 2.3 Bénéfices Attendus

| Domaine | Bénéfice |
|---------|----------|
| **Productivité** | Réduction de 70% du temps de production des rapports |
| **Visibilité** | Tableau de bord temps réel sur les KPI critiques |
| **Collaboration** | Centralisation des informations pour toutes les équipes |
| **Qualité** | Standardisation des indicateurs et méthodes de calcul |
| **Anticipation** | Alertes proactives et analyses prédictives |

---

## 3. PÉRIMÈTRE FONCTIONNEL

### 3.1 Module Core - Gestion Stratégique

#### 3.1.1 Tableau de Bord Global
- Vue multi-centres avec indicateurs clés
- Synthèse des alertes actives
- Actions en cours et retards
- Statut des équipes et recrutements
- Compte à rebours des projets
- Tendances de performance (mensuel/trimestriel/annuel)

#### 3.1.2 Gestion des Centres
- CRUD complet des centres commerciaux
- Configuration par centre (exercice fiscal, devise, seuils)
- Gestion multi-niveaux (étages, zones)
- Statuts : Actif, En construction, Inactif
- Mode transition entre statuts
- Personnalisation visuelle (thème, logo)

#### 3.1.3 Pilotage Stratégique
- Axes stratégiques hiérarchiques (6-8 axes par centre)
- Objectifs par axe avec définition des KPI
- Configuration de la fréquence de mesure
- Seuils d'alerte (Vert/Orange/Rouge)
- Système de pondération des objectifs
- Historique des mesures
- Tableau de bord temps réel des KPI

#### 3.1.4 Plans d'Actions
- Création et suivi des plans d'action liés aux objectifs
- Niveaux de priorité : Critique, Haute, Moyenne, Basse
- Statuts : À faire, En cours, En attente, Terminé, Annulé
- Décomposition en sous-actions
- Allocation et suivi budgétaire
- Registre des risques par action
- Fils de commentaires et discussion
- Suivi du pourcentage d'avancement

#### 3.1.5 Réunions et Gouvernance
- Types de réunions : Point hebdo, Comité de pilotage, Revue mensuelle, etc.
- Gestion des participants
- Ordre du jour
- Comptes-rendus et PV
- Suivi des décisions
- Création d'actions depuis les réunions

#### 3.1.6 Gestion des Équipes
- Base de données complète des employés
- Organisation par département (6 départements)
- Types de contrat : CDI, CDD, Stage, Intérim, Consultant, Prestataire
- Suivi des compétences avec niveaux
- Historique des formations
- Gestion des absences
- Hiérarchie managériale
- Matrice des compétences

#### 3.1.7 Évaluations de Performance
- Évaluations périodiques
- Critères multiples avec pondération
- Points forts et axes d'amélioration
- Objectifs pour la période suivante
- Workflow de validation

#### 3.1.8 Conformité et Audits
- Planification des audits
- Types : Interne, Externe, Réglementaire
- Suivi des non-conformités
- Niveaux de gravité : Mineure, Majeure, Critique
- Actions correctives
- Stockage des rapports d'audit

#### 3.1.9 Gestion des Risques
- Identification et catégorisation des risques
- Scoring Probabilité x Impact
- Plans de mitigation
- Attribution de responsables
- Revues régulières

#### 3.1.10 Alertes et Notifications
- Alertes KPI critiques
- Retards sur actions
- Rappels de saisie (J-5)
- Échéances proches
- Configuration email (EmailJS)
- Mode digest (quotidien, hebdomadaire)
- Historique des alertes

#### 3.1.11 Analyse Comparative
- Comparaison multi-centres
- Métriques côte à côte
- Benchmarking
- Classement des performances

### 3.2 Module Projet - Lancement de Centres

#### 3.2.1 Tableau de Bord Projet
- Vue d'ensemble du projet (Préparation, Mobilisation, Lancement, Stabilisation, Clôture)
- Comptes à rebours (Soft Opening, Grand Opening)
- Suivi d'avancement par phase
- Chemin critique
- Vue budget (Total, Alloué, Consommé)
- Alertes risques

#### 3.2.2 Gestion des Jalons
- Types PMI/PRINCE2 : Gates, Livrables, Checkpoints, Revues, Approbations, Handovers
- Catégories : Gouvernance, Commercial, Technique, RH, Finance, Juridique, Marketing, Opérations
- Statut RAG (Rouge/Ambre/Vert/Gris)
- Suivi des livrables
- Critères d'acceptation
- Gestion des dépendances

#### 3.2.3 Gestion du Recrutement
- Planification par vagues
- Suivi des postes par département
- Workflow de recrutement
- Shortlist des candidats
- Suivi des négociations
- Intégration

#### 3.2.4 Commercialisation
- Gestion des prospects
- Suivi des négociations
- Workflow jusqu'à la signature du bail
- Système BEFA (Bail, État, Finances, Appels)
- Gestion des lots en réserve
- Identification des locomotives

#### 3.2.5 Handover
- Planification par phases
- Documents DOE (Dossiers des Ouvrages Exécutés)
- Suivi lot par lot
- Vérification de conformité
- Processus de réception finale

#### 3.2.6 Gestion Budgétaire Projet
- Budget par phase
- Allocation par catégorie
- Suivi des engagements
- Monitoring de la consommation
- Analyse des écarts
- Gestion des provisions

#### 3.2.7 Risques Projet
- Catégories : Planning, Budget, Technique, Commercial, RH, Externe, Réglementaire
- Niveaux de criticité
- Stratégies de mitigation
- Procédures d'escalade

### 3.3 Module BI - Business Intelligence

#### 3.3.1 Import de Données
- Formats supportés : Excel, CSV, PDF, JSON
- 12 catégories de données :
  - État locatif (baux, locataires, surfaces)
  - Loyers et charges (quittancement, encaissements)
  - Fréquentation (comptage visiteurs)
  - Chiffre d'affaires (CA déclaré des locataires)
  - Charges d'exploitation
  - Travaux (construction/maintenance)
  - Valorisation immobilière
  - Consommation énergétique
  - Satisfaction (enquêtes locataires/visiteurs)
  - Surfaces et plans
  - Prévisions budgétaires
- Organisation par dossiers
- Mapping et auto-détection des colonnes
- Score de qualité des données (0-100)
- Validation avec rapport d'erreurs
- Historique des imports

#### 3.3.2 Catalogue et Gestion
- Définitions des types de rapports
- Packs de rapports (collections prédéfinies)
- Bibliothèque de modèles
- Niveaux de complexité
- Suivi des rapports populaires
- Recommandations IA

#### 3.3.3 Report Studio (Éditeur Visuel)
- Éditeur WYSIWYG
- Architecture par blocs :
  - Titres (avec styles)
  - Paragraphes (avec formatage)
  - Graphiques (80+ types)
  - Cartes KPI
  - Tableaux de données
  - Images
  - Callouts/Encadrés
  - Séparateurs
- Gestion des sections imbriquées
- Interface drag-and-drop
- Aperçu temps réel
- Paramètres de design (couleurs, polices, marges)
- Suggestions IA
- Historique illimité (Undo/Redo)
- Bibliothèque de modèles
- Sauvegarde automatique

#### 3.3.4 Catalogue de Graphiques (80+ types)
Organisés en 11 catégories :
1. **Comparaison** - Barres, radar, bulles
2. **Tendance** - Lignes, aires, chandeliers
3. **Distribution** - Camemberts, donuts, sunburst, treemap
4. **Relations** - Nuages de points, corrélation, réseaux
5. **Hiérarchie** - Treemaps, dendrogrammes, sankey
6. **Géographique** - Cartes, choroplèthes, cartes de chaleur
7. **KPI** - Jauges, compteurs, barres de progression
8. **Tableaux** - Tables de données, tableaux croisés dynamiques
9. **3D/Immersif** - Surfaces 3D, nuages 3D
10. **Animé** - Graphiques animés
11. **Statistique** - Histogrammes, box plots, violin plots

#### 3.3.5 Moteur d'Analyse
- Génération automatique d'insights
- 40+ KPI prédéfinis :
  - **Financier :** NOI, NOI/m², Rendement brut/net, Charges d'exploitation
  - **Durée de bail :** WAULT, WALB, WALT
  - **Occupation :** Taux d'occupation, m² vacants, Ratio d'occupation
  - **Santé financière :** Taux d'effort, Taux de recouvrement, Revenus locatifs
  - **Valorisation :** Valeur du patrimoine, Valeur au m², Taux de capitalisation
  - **Mix locataires :** Ratio de concentration, Indice de diversité
  - **Trafic & Ventes :** Fréquentation, CA par visiteur, CA au m²
  - **Énergie :** Consommation, Intensité énergétique, Potentiel d'économies
  - **Risque :** Concentration des baux, Solvabilité locataires, Risque portefeuille

- Moteur de règles d'alertes :
  - Règles prédéfinies
  - Création de règles personnalisées
  - Conditions multiples
  - Déclenchement par seuils

- Analyses prédictives :
  - Analyse et prévision des tendances
  - Prédictions d'occupation
  - Prévisions de revenus

- Benchmarking :
  - Comparaison historique
  - Benchmarking multi-centres
  - Comparaison sectorielle

#### 3.3.6 Export et Distribution
- Export multi-format :
  - PDF (haute qualité avec images et graphiques)
  - Excel (tableaux de données avec formules)
  - PowerPoint (présentations formatées)
- Distribution par email
- Génération programmée de rapports
- Export par lot

### 3.4 Paramètres et Administration

- Sélection du thème (Clair, Sombre, Système)
- Sélection de la langue (Français, extensible)
- Configuration email
- Préférences de digest
- Gestion des versions de données

---

## 4. ARCHITECTURE TECHNIQUE

### 4.1 Stack Technologique

#### Frontend
| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.3.1 | Framework UI |
| TypeScript | 5.5.3 | Typage statique |
| Vite | 5.4.2 | Build tool et serveur de développement |
| Tailwind CSS | 3.4.1 | Framework CSS utilitaire |
| React Router DOM | 7.11.0 | Routage client |

#### Gestion d'État et Données
| Technologie | Version | Rôle |
|-------------|---------|------|
| Zustand | 5.0.9 | Gestion d'état légère |
| Dexie | 4.2.1 | Wrapper IndexedDB |

#### Visualisation
| Technologie | Version | Rôle |
|-------------|---------|------|
| Recharts | 3.6.0 | Bibliothèque de graphiques React |
| Chart.js | 4.5.1 | Moteur de graphiques |
| React-ChartJS-2 | 5.3.1 | Wrapper React pour Chart.js |

#### Export et Génération de Documents
| Technologie | Version | Rôle |
|-------------|---------|------|
| jsPDF | 4.0.0 | Génération PDF |
| html2canvas | 1.4.1 | Conversion HTML vers image |
| XLSX | 0.18.5 | Création/parsing de fichiers Excel |
| PptxGenJS | 4.0.1 | Génération PowerPoint |

#### UI et Icônes
| Technologie | Version | Rôle |
|-------------|---------|------|
| Lucide React | 0.344.0 | Bibliothèque d'icônes (350+) |
| Date-fns | 4.1.0 | Utilitaires date/heure |

#### Communication
| Technologie | Version | Rôle |
|-------------|---------|------|
| EmailJS | 4.4.1 | Envoi d'emails côté client |

### 4.2 Architecture de l'Application

```
┌─────────────────────────────────────────────────────────────────┐
│                        COCKPIT SPA                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   PAGES     │  │  COMPONENTS │  │    REPORT STUDIO        │ │
│  │  (20 vues)  │  │   (110+)    │  │   (Éditeur WYSIWYG)     │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                      │               │
│         └────────────────┼──────────────────────┘               │
│                          │                                      │
│  ┌───────────────────────┴──────────────────────────────────┐  │
│  │                   ZUSTAND STORES (17)                     │  │
│  │  appStore | centresStore | equipeStore | axesStore | ...  │  │
│  └───────────────────────┬──────────────────────────────────┘  │
│                          │                                      │
│  ┌───────────────────────┴──────────────────────────────────┐  │
│  │                    DEXIE DATABASE                         │  │
│  │           IndexedDB - 42 tables - 5 versions              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   UTILITAIRES / ENGINES                   │  │
│  │  kpiCalculations | alertEngine | insightEngine |          │  │
│  │  predictionEngine | fileParser | dataValidation |         │  │
│  │  exportHelpers | rapportBuilder | reportExport            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │         NAVIGATEUR            │
              │    IndexedDB (persistance)    │
              │    EmailJS (notifications)    │
              └───────────────────────────────┘
```

### 4.3 Structure des Répertoires

```
src/
├── main.tsx                 # Point d'entrée
├── App.tsx                  # Composant racine avec routage
├── index.css                # Styles globaux
├── components/              # Composants réutilisables
│   ├── ui/                  # Composants UI de base
│   ├── layout/              # Composants de mise en page
│   ├── charts/              # Composants graphiques
│   ├── gantt/               # Diagramme de Gantt
│   ├── catalog/             # Catalogue de graphiques
│   └── ReportStudio/        # Éditeur de rapports
├── pages/                   # Pages complètes
│   ├── bi/                  # Pages module BI
│   └── [autres pages]       # Pages principales
├── store/                   # Stores Zustand (17)
├── db/                      # Schéma base de données Dexie
├── types/                   # Définitions TypeScript
├── utils/                   # Fonctions utilitaires
├── config/                  # Configuration
├── data/                    # Données de référence
├── hooks/                   # Hooks React personnalisés
└── assets/                  # Ressources statiques
```

### 4.4 Routage

```
/ (layout racine)
├── /                         → Dashboard global
├── /comparateur              → Comparaison multi-centres
├── /centres                  → Gestion des centres
├── /centre/:centreId
│   ├── /                     → Dashboard centre
│   ├── /pilotage            → KPIs stratégiques
│   ├── /actions             → Plans d'actions
│   ├── /agenda              → Réunions
│   ├── /reporting           → Rapports
│   ├── /equipe              → Gestion équipe
│   ├── /evaluations         → Évaluations
│   ├── /conformite          → Conformité
│   ├── /bi/import           → Import données
│   ├── /bi/catalogue        → Catalogue rapports
│   ├── /bi/analyse          → Vue analyse
│   ├── /bi/rapports         → Report studio
│   ├── /projet              → Dashboard projet
│   ├── /projet/jalons       → Jalons
│   ├── /projet/recrutement  → Recrutement
│   ├── /projet/commercial   → Commercialisation
│   ├── /projet/handover     → Handover
│   ├── /projet/budget       → Budget
│   └── /projet/risques      → Risques
├── /alertes                  → Alertes globales
└── /parametres               → Paramètres
```

---

## 5. SPÉCIFICATIONS FONCTIONNELLES

### 5.1 Fonctionnalités Détaillées - Module Core

#### SF-CORE-001 : Gestion des Centres Commerciaux

**Description :** Permettre la création, modification et suppression des centres commerciaux du réseau.

**Règles de gestion :**
- Chaque centre possède un code unique
- Un centre peut avoir 3 statuts : Actif, En construction, Inactif
- Le mode "Exploitation" permet de basculer entre la gestion courante et le mode projet
- La devise par défaut est XOF (Franc CFA)
- L'exercice fiscal est configurable (par défaut janvier-décembre)

**Données gérées :**
- Identification : code, nom, adresse, ville
- Caractéristiques : surface totale, surface locative, nombre de niveaux, nombre de locaux
- Configuration : devise, exercice fiscal, seuils d'alerte
- Personnalisation : logo, couleur thème

#### SF-CORE-002 : Pilotage Stratégique par Axes

**Description :** Organiser les objectifs stratégiques en axes pondérés avec suivi des KPI.

**Règles de gestion :**
- Un centre peut avoir jusqu'à 8 axes stratégiques
- La somme des poids des axes doit être égale à 100%
- Chaque objectif est rattaché à un axe unique
- Les mesures sont saisies selon la fréquence définie
- Le statut d'un KPI (Vert/Orange/Rouge) est calculé automatiquement selon les seuils

**Fréquences de mesure disponibles :**
- Quotidien, Hebdomadaire, Mensuel, Bimestriel, Trimestriel, Semestriel, Annuel

#### SF-CORE-003 : Gestion des Plans d'Actions

**Description :** Créer et suivre des actions correctives ou d'amélioration.

**Règles de gestion :**
- Une action peut être liée à un axe et/ou un objectif
- L'avancement est calculé automatiquement à partir des sous-actions
- Une alerte est générée si le retard dépasse le seuil configuré
- Le statut passe automatiquement à "Terminé" quand l'avancement atteint 100%

**Workflow des statuts :**
```
À faire → En cours → En attente → Terminé
                  └→ Annulé
```

#### SF-CORE-004 : Système d'Alertes

**Description :** Générer et gérer les alertes proactives sur les indicateurs et échéances.

**Types d'alertes :**
| Type | Déclencheur | Priorité |
|------|-------------|----------|
| KPI Critique | KPI en statut Rouge | Critique |
| Retard Action | Dépassement échéance | Haute |
| Rappel Saisie | J-5 avant deadline | Normale |
| Échéance Proche | J-3 avant deadline | Normale |
| Réunion | Réunion planifiée | Info |
| Audit | Audit à venir | Haute |

**Règles de notification :**
- Les alertes critiques sont envoyées immédiatement par email
- Les alertes normales sont groupées en digest (quotidien/hebdomadaire)
- Une alerte lue n'est pas supprimée mais marquée comme traitée

### 5.2 Fonctionnalités Détaillées - Module Projet

#### SF-PROJ-001 : Gestion des Phases de Projet

**Description :** Structurer le projet de lancement en phases distinctes.

**Phases standards :**
1. Préparation
2. Mobilisation
3. Lancement
4. Stabilisation
5. Clôture

**Règles de gestion :**
- Chaque phase a des dates de début et fin planifiées
- Le passage de phase est conditionné par la validation des jalons obligatoires
- Le budget est alloué et suivi par phase

#### SF-PROJ-002 : Gestion des Jalons

**Description :** Définir et suivre les jalons critiques du projet.

**Types de jalons (PMI/PRINCE2) :**
- Gate : Point de décision Go/No-Go
- Livrable : Production d'un document ou résultat
- Checkpoint : Point de contrôle intermédiaire
- Revue : Revue qualité formelle
- Approbation : Validation formelle
- Handover : Transfert de responsabilité
- Go-Live : Mise en service
- Clôture : Fin de phase/projet

**Statut RAG :**
- Vert : Dans les temps, conforme
- Ambre : À risque, attention requise
- Rouge : En retard ou non conforme
- Gris : Non démarré ou reporté

#### SF-PROJ-003 : Processus de Recrutement

**Description :** Gérer les recrutements pour l'équipe du nouveau centre.

**Workflow de recrutement :**
```
Création poste → Diffusion → Présélection → Entretiens →
Shortlist → Offre → Négociation → Acceptation → Intégration
```

**Règles de gestion :**
- Les postes sont organisés par vagues de recrutement prioritaires
- Chaque poste est rattaché à un département
- Le suivi inclut les dates prévisionnelles et réelles

#### SF-PROJ-004 : Processus de Commercialisation

**Description :** Gérer l'acquisition des locataires avant ouverture.

**Workflow commercial :**
```
Identifié → Contacté → Intéressé → Négociation →
Offre envoyée → Bail signé
        └→ Perdu / En attente
```

**Indicateurs suivis :**
- Taux de pré-commercialisation
- Nombre de locomotives signées
- Surface commercialisée vs surface totale

### 5.3 Fonctionnalités Détaillées - Module BI

#### SF-BI-001 : Import de Données Multi-Sources

**Description :** Permettre l'import de données depuis différentes sources et formats.

**Formats supportés :**
| Format | Extension | Traitement |
|--------|-----------|------------|
| Excel | .xlsx, .xls | Parsing colonnes avec mapping |
| CSV | .csv | Parsing avec détection séparateur |
| PDF | .pdf | Extraction texte et tables |
| JSON | .json | Parsing direct |

**Processus d'import :**
1. Upload du fichier
2. Détection automatique du type de données
3. Mapping des colonnes (auto + manuel)
4. Validation des données
5. Calcul du score de qualité
6. Import avec rapport d'erreurs

**Score de qualité :**
- 90-100% : Excellent - Import direct
- 70-89% : Bon - Import avec avertissements
- 50-69% : Moyen - Révision recommandée
- <50% : Insuffisant - Correction nécessaire

#### SF-BI-002 : Calcul Automatique des KPI

**Description :** Calculer automatiquement les indicateurs à partir des données importées.

**KPI Financiers :**
| KPI | Formule | Unité |
|-----|---------|-------|
| NOI (Net Operating Income) | Revenus locatifs - Charges d'exploitation | € |
| NOI/m² | NOI / Surface locative | €/m² |
| Rendement brut | (Loyers annuels / Valeur patrimoine) × 100 | % |
| Rendement net | (NOI / Valeur patrimoine) × 100 | % |

**KPI Occupation :**
| KPI | Formule | Unité |
|-----|---------|-------|
| Taux d'occupation | (Surface occupée / Surface totale) × 100 | % |
| Taux de vacance | (Surface vacante / Surface totale) × 100 | % |
| WAULT | Moyenne pondérée durée résiduelle des baux | Mois |

**KPI Trafic :**
| KPI | Formule | Unité |
|-----|---------|-------|
| CA/m² | Chiffre d'affaires total / Surface commerciale | €/m² |
| CA/visiteur | Chiffre d'affaires total / Nombre de visiteurs | € |
| Taux de transformation | (Transactions / Visiteurs) × 100 | % |

#### SF-BI-003 : Éditeur de Rapports (Report Studio)

**Description :** Permettre la création visuelle de rapports personnalisés.

**Blocs disponibles :**
| Bloc | Description | Paramètres |
|------|-------------|------------|
| Titre | En-tête avec style | Niveau (H1-H4), alignement |
| Paragraphe | Texte formaté | Gras, italique, alignement |
| Graphique | Visualisation de données | Type, données, options |
| KPI | Carte indicateur | Valeur, tendance, comparaison |
| Tableau | Table de données | Colonnes, tri, pagination |
| Image | Image insérée | Source, taille, légende |
| Callout | Encadré d'alerte | Type (info, warning, success) |
| Séparateur | Ligne de séparation | Style, épaisseur |

**Fonctionnalités de l'éditeur :**
- Drag-and-drop des blocs
- Aperçu temps réel
- Paramètres de design globaux
- Historique illimité (Undo/Redo)
- Sauvegarde automatique
- Export multi-format

---

## 6. MODÈLE DE DONNÉES

### 6.1 Schéma de la Base de Données

**Base de données :** IndexedDB via Dexie
**Nom :** CockpitCRMC
**Version actuelle :** 5

### 6.2 Tables Principales (42 tables)

#### Tables Core (15 tables)
```
centres                 - Centres commerciaux
postes                  - Postes/fonctions
membresEquipe           - Membres de l'équipe
axes                    - Axes stratégiques
objectifs               - Objectifs/KPI
mesures                 - Mesures des KPI
actions                 - Plans d'action
reunions                - Réunions
livrables               - Livrables/rapports
evaluations             - Évaluations de performance
audits                  - Audits et conformité
risques                 - Registre des risques
alertes                 - Notifications et alertes
parametres              - Paramètres application
importLogs              - Historique des imports
```

#### Tables BI (12 tables)
```
fichiersImport          - Fichiers importés
dossiersImport          - Organisation en dossiers
etatsLocatifs           - Snapshots état locatif
donneesLoyers           - Données loyers/charges
donneesFrequentation    - Données trafic
donneesChiffreAffaires  - Données CA
donneesCharges          - Charges d'exploitation
donneesBaux             - Contrats de bail
donneesTravaux          - Travaux
donneesValorisation     - Valorisation patrimoine
donneesEnergie          - Consommation énergie
donneesSatisfaction     - Enquêtes satisfaction
```

#### Tables Catalogue (2 tables)
```
typesRapport            - Types de rapports
packsRapport            - Packs de rapports
```

#### Tables Report Studio (2 tables)
```
rapports                - Rapports générés
modelesRapport          - Modèles de rapports
```

#### Tables Analytics (7 tables)
```
resultatsKPI            - Résultats KPI calculés
insights                - Insights générés
reglesAlerte            - Règles d'alertes
alertesGenerees         - Alertes déclenchées
tendancesPrediction     - Prédictions tendances
benchmarks              - Benchmarks
configurationsBI        - Configuration BI
```

#### Tables Projet (14 tables)
```
projets                 - Projets
phasesProjet            - Phases projet
jalons                  - Jalons
vaguesRecrutement       - Vagues recrutement
postesARecruter         - Postes à pourvoir
prospectsCommerciaux    - Prospects
suiviBEFA               - Suivi BEFA
reserves                - Lots en réserve
documentsDOE            - Documents DOE
risquesProjet           - Risques projet
actionsCommunication    - Actions communication
evenementsLancement     - Événements
phasesHandover          - Phases handover
jalonsCommerciaux       - Jalons commerciaux
```

### 6.3 Entités Principales

#### Centre Commercial
```typescript
{
  id: UUID
  code: string                    // Code unique
  nom: string                     // Nom du centre
  adresse: string                 // Adresse postale
  ville: string                   // Ville
  dateOuverture: string           // Date d'ouverture (ISO)
  surfaceTotale: number           // Surface totale en m²
  surfaceLocative: number         // Surface locative en m²
  nombreNiveaux: number           // Nombre de niveaux
  nombreLocaux: number            // Nombre de cellules
  statut: 'actif'|'en_construction'|'inactif'
  modeExploitationActif: boolean  // Mode exploitation activé
  modeProjetActif: boolean        // Mode projet activé
  logo?: string                   // Logo en base64
  couleurTheme: string            // Couleur thème (hex)
  configuration: {
    deviseMonetaire: string       // Devise (XOF)
    exerciceFiscal: {debut, fin}  // Mois début/fin exercice
    objectifsAnnee: number        // Année des objectifs
    seuilsAlerte: {
      kpiRouge: number            // Seuil KPI rouge (%)
      kpiOrange: number           // Seuil KPI orange (%)
      retardAction: number        // Jours retard action
      rappelSaisie: number        // Jours rappel saisie
    }
  }
  createdAt: string
  updatedAt: string
}
```

#### Membre Équipe
```typescript
{
  id: UUID
  centreId: UUID                  // Centre de rattachement
  matricule: string               // Matricule employé
  nom: string
  prenom: string
  photo?: string                  // Photo base64
  email: string
  telephone: string
  poste: string                   // Intitulé du poste
  departement: Enum               // Département
  typeContrat: Enum               // Type de contrat
  dateEmbauche: string
  dateFinContrat?: string
  managerId?: UUID                // Manager hiérarchique
  statut: Enum                    // Statut actuel
  competences: Competence[]       // Liste des compétences
  formations: Formation[]         // Historique formations
  absences: Absence[]             // Historique absences
}
```

#### Objectif / KPI
```typescript
{
  id: UUID
  axeId: UUID                     // Axe stratégique
  centreId: UUID
  code: string                    // Code KPI
  intitule: string                // Nom du KPI
  description: string
  kpiNom: string                  // Nom technique
  cible: string|number            // Valeur cible
  poids: number                   // Pondération (%)
  frequenceMesure: Enum           // Fréquence de mesure
  responsableId?: UUID            // Responsable
  formuleCalcul?: string          // Formule de calcul
  seuilVert: number               // Seuil pour statut vert
  seuilOrange: number             // Seuil pour statut orange
  seuilRouge: number              // Seuil pour statut rouge
}
```

#### Plan d'Action
```typescript
{
  id: UUID
  centreId: UUID
  axeId?: UUID                    // Axe lié (optionnel)
  objectifId?: UUID               // Objectif lié (optionnel)
  titre: string
  description: string
  priorite: 'critique'|'haute'|'moyenne'|'basse'
  statut: 'a_faire'|'en_cours'|'en_attente'|'termine'|'annule'
  responsableId?: UUID
  contributeurs: UUID[]
  dateDebut: string
  dateEcheance: string
  dateRealisation?: string
  avancement: number              // 0-100%
  sousActions: SousAction[]
  budget?: {
    prevu: number
    consomme: number
    devise: string
  }
  risques: Risque[]
  commentaires: Commentaire[]
}
```

---

## 7. INTERFACE UTILISATEUR

### 7.1 Principes de Design

#### Identité Visuelle
- **Police principale :** Exo 2 (sans-serif moderne)
- **Police d'affichage :** Grand Hotel (décorative)
- **Police code :** JetBrains Mono

#### Palette de Couleurs
```
Gris professionnel (primaire):
- 50: #fafafa  → Fond clair
- 100: #f5f5f5 → Fond alternatif
- 500: #737373 → Texte secondaire
- 800: #262626 → Texte principal
- 900: #171717 → Titres

Couleurs de statut:
- Succès: #22c55e (Vert)
- Attention: #f59e0b (Ambre)
- Erreur: #ef4444 (Rouge)
- Info: #3b82f6 (Bleu)

Couleurs des axes stratégiques:
- Finance: #3b82f6
- Opérations: #10b981
- Gouvernance: #8b5cf6
- Développement: #f97316
- Leadership: #ec4899
- Parties prenantes: #06b6d4
```

#### Principes UX
- **Mobile-first** : Design responsive adapté à tous les écrans
- **Accessibilité** : Conformité WCAG AA
- **Mode sombre** : Support complet dark mode
- **Feedback visuel** : Toast notifications et indicateurs de chargement

### 7.2 Composants Principaux

#### Layout
- **Sidebar** : Navigation principale, collapsible (64px → 256px)
- **Header** : Barre supérieure avec recherche, alertes, profil
- **Content** : Zone principale avec padding responsive
- **Toast** : Notifications temporaires coin inférieur droit

#### Composants UI
- **Button** : Primary, Secondary, Danger, Ghost
- **Card** : Container avec header, titre, contenu
- **Modal** : Dialogue centré avec overlay
- **Badge** : Indicateur de statut coloré
- **Table** : Tableau de données avec tri et pagination
- **Form controls** : Input, Select, Textarea, Checkbox

#### Composants Métier
- **StatutKPIBadge** : Affichage statut KPI (Vert/Orange/Rouge)
- **PerformanceGauge** : Jauge de performance circulaire
- **Sparkline** : Mini graphique de tendance
- **GanttChart** : Diagramme de Gantt interactif
- **KPIHeatmap** : Grille de chaleur des KPI

### 7.3 Écrans Principaux

#### Dashboard Global
```
┌────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Recherche | Alertes | Profil               │
├─────────┬──────────────────────────────────────────────────┤
│         │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│ SIDEBAR │  │ KPI 1   │ │ KPI 2   │ │ KPI 3   │ │ KPI 4   ││
│         │  └─────────┘ └─────────┘ └─────────┘ └─────────┘│
│ - Home  │  ┌──────────────────┐  ┌──────────────────────┐ │
│ - Centre│  │                  │  │                      │ │
│ - Pilota│  │  GRAPHIQUE       │  │  ALERTES             │ │
│ - Action│  │  TENDANCES       │  │  RÉCENTES            │ │
│ - Agenda│  │                  │  │                      │ │
│ - Report│  └──────────────────┘  └──────────────────────┘ │
│ - Équipe│  ┌─────────────────────────────────────────────┐│
│ - BI    │  │  LISTE DES CENTRES                         ││
│ - Projet│  │  [Centre 1] [Centre 2] [Centre 3]          ││
│ - Param │  └─────────────────────────────────────────────┘│
└─────────┴──────────────────────────────────────────────────┘
```

#### Report Studio
```
┌────────────────────────────────────────────────────────────┐
│ HEADER: Nom rapport | Sauvegarder | Exporter | Prévisual. │
├────────────┬───────────────────────────────┬───────────────┤
│ STRUCTURE  │  CANVAS D'ÉDITION             │  PROPRIÉTÉS   │
│            │                               │               │
│ - Section 1│  ┌─────────────────────────┐  │  [Bloc sel.]  │
│   - Titre  │  │ BLOC EN ÉDITION         │  │               │
│   - Graph  │  │                         │  │  Type: Graph  │
│ - Section 2│  │    ████████             │  │  Données: ... │
│   - KPI    │  │    ████                 │  │  Style: ...   │
│   - Table  │  │    ██████████           │  │               │
│            │  │                         │  │  [Supprimer]  │
│ [+ Bloc]   │  └─────────────────────────┘  │               │
└────────────┴───────────────────────────────┴───────────────┘
│                    BARRE D'OUTILS                          │
│  [Titre] [Para] [Graph] [KPI] [Table] [Image] [Divider]   │
└────────────────────────────────────────────────────────────┘
```

---

## 8. EXIGENCES NON FONCTIONNELLES

### 8.1 Performance

| Exigence | Cible | Mesure |
|----------|-------|--------|
| Temps de chargement initial | < 3 secondes | First Contentful Paint |
| Temps de navigation entre pages | < 500 ms | Time to Interactive |
| Génération de rapport PDF | < 10 secondes | Pour un rapport de 20 pages |
| Import de fichier (1000 lignes) | < 5 secondes | Parsing + validation |
| Calcul des KPI | < 2 secondes | Pour 1 an de données |

### 8.2 Capacité

| Élément | Capacité cible |
|---------|----------------|
| Nombre de centres | Jusqu'à 50 |
| Historique de mesures | 5 ans par centre |
| Taille fichier import | Jusqu'à 50 MB |
| Nombre d'utilisateurs simultanés | Non applicable (client-side) |

### 8.3 Disponibilité

| Exigence | Description |
|----------|-------------|
| Mode hors ligne | L'application fonctionne sans connexion internet |
| Persistance des données | Données stockées localement dans IndexedDB |
| Récupération après crash | Auto-save toutes les 30 secondes dans Report Studio |

### 8.4 Compatibilité

| Navigateur | Version minimale |
|------------|------------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

| Résolution | Support |
|------------|---------|
| Desktop | 1280x720 et plus |
| Tablet | 768x1024 et plus |
| Mobile | 375x667 et plus |

### 8.5 Sécurité

| Aspect | Mesure |
|--------|--------|
| Stockage des données | IndexedDB (données locales) |
| Envoi d'emails | Clés API EmailJS stockées côté client |
| Fichiers uploadés | Stockés en base64 dans IndexedDB |
| Validation des entrées | Validation côté client |

**Note :** La version actuelle est une application client-side sans backend. Les mesures de sécurité avancées (authentification, chiffrement, RBAC) sont prévues pour les évolutions futures.

### 8.6 Maintenabilité

| Aspect | Approche |
|--------|----------|
| Architecture | Composants React modulaires |
| Typage | TypeScript strict |
| Gestion d'état | Stores Zustand séparés par domaine |
| Base de données | Migrations Dexie versionnées |
| Style | Tailwind CSS utilitaire |
| Qualité code | ESLint avec règles React et TypeScript |

### 8.7 Internationalisation

| Aspect | État |
|--------|------|
| Langue interface | Français (complet) |
| Extensibilité | Architecture préparée pour multi-langues |
| Format dates | date-fns avec locale fr |
| Format nombres | Intl.NumberFormat fr-FR |
| Devise | Configurable par centre (défaut XOF) |

---

## 9. CONTRAINTES ET LIMITES

### 9.1 Contraintes Techniques

| Contrainte | Impact |
|------------|--------|
| Application client-side uniquement | Pas de synchronisation multi-appareils |
| Stockage IndexedDB | Limite de stockage navigateur (~500 MB) |
| Pas d'authentification | Accès libre à l'application |
| EmailJS côté client | Clés API exposées (usage limité) |

### 9.2 Limites Fonctionnelles

| Limite | Description |
|--------|-------------|
| Collaboration | Pas de travail simultané multi-utilisateurs |
| Sauvegarde cloud | Pas de backup automatique distant |
| Notifications push | Pas de notifications navigateur |
| Import PDF | Extraction limitée aux tableaux simples |

### 9.3 Dépendances Externes

| Service | Usage | Criticité |
|---------|-------|-----------|
| EmailJS | Envoi de notifications email | Optionnel |
| CDN polices | Chargement des polices (Exo 2, etc.) | Moyen |

---

## 10. ÉVOLUTIONS PRÉVUES

### 10.1 Phase 1 - Sécurité et Multi-utilisateurs

- [ ] Système d'authentification (login/mot de passe)
- [ ] Gestion des rôles et permissions (RBAC)
- [ ] Backend API (Node.js/Express ou équivalent)
- [ ] Base de données serveur (PostgreSQL)
- [ ] Synchronisation multi-appareils
- [ ] Chiffrement des données sensibles

### 10.2 Phase 2 - Fonctionnalités Avancées

- [ ] Application mobile (React Native)
- [ ] Mode hors ligne avec synchronisation
- [ ] Collaboration temps réel (WebSocket)
- [ ] Planification automatique des rapports
- [ ] Webhooks et intégrations tierces
- [ ] Notifications push navigateur

### 10.3 Phase 3 - Intelligence Artificielle

- [ ] Analyse prédictive ML (time series)
- [ ] Génération automatique d'insights
- [ ] Recommandations d'actions
- [ ] Détection d'anomalies
- [ ] Chatbot assistant

### 10.4 Phase 4 - Entreprise

- [ ] Architecture multi-tenant SaaS
- [ ] Authentification SSO (SAML/OAuth)
- [ ] Double authentification (2FA)
- [ ] Audit trail complet
- [ ] Intégration ERP/Comptabilité
- [ ] API publique documentée

---

## ANNEXES

### A. Glossaire

| Terme | Définition |
|-------|------------|
| **Axe stratégique** | Domaine de pilotage regroupant des objectifs (ex: Finance, Opérations) |
| **KPI** | Key Performance Indicator - Indicateur clé de performance |
| **NOI** | Net Operating Income - Résultat net d'exploitation |
| **WAULT** | Weighted Average Unexpired Lease Term - Durée moyenne pondérée des baux |
| **RAG** | Red/Amber/Green - Système de statut tricolore |
| **BEFA** | Bail/État/Finances/Appels - Système de suivi commercial |
| **DOE** | Dossier des Ouvrages Exécutés - Documentation technique |
| **Locomotive** | Locataire majeur/ancre d'un centre commercial |

### B. Références Techniques

| Document | Lien |
|----------|------|
| React | https://react.dev |
| TypeScript | https://www.typescriptlang.org |
| Tailwind CSS | https://tailwindcss.com |
| Dexie.js | https://dexie.org |
| Zustand | https://zustand-demo.pmnd.rs |
| Recharts | https://recharts.org |
| Lucide Icons | https://lucide.dev |

### C. Historique des Versions du Document

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 11/01/2026 | - | Création initiale |

---

**Fin du Cahier des Charges**

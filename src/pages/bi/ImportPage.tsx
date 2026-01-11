import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Eye,
  FileText,
  Clock,
  Database,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Modal,
  Input,
  Select,
} from '../../components/ui';
import { useImportStore, useCentresStore, useAppStore } from '../../store';
import type { CategorieImport } from '../../types/bi';

const CATEGORIES_IMPORT: { value: CategorieImport; label: string; description: string }[] = [
  { value: 'etat_locatif', label: 'État locatif', description: 'Baux, locataires, surfaces' },
  { value: 'loyers', label: 'Loyers', description: 'Quittancement et encaissements' },
  { value: 'frequentation', label: 'Fréquentation', description: 'Comptages visiteurs' },
  { value: 'chiffre_affaires', label: 'Chiffre d\'affaires', description: 'CA déclarés par enseignes' },
  { value: 'charges', label: 'Charges', description: 'Charges d\'exploitation' },
  { value: 'bail', label: 'Baux', description: 'Détails des contrats de bail' },
  { value: 'travaux', label: 'Travaux', description: 'Projets et interventions' },
  { value: 'budget', label: 'Budget', description: 'Budget prévisionnel' },
  { value: 'valorisation', label: 'Valorisation', description: 'Expertises et valeurs' },
  { value: 'surface', label: 'Surfaces', description: 'Détail des surfaces' },
  { value: 'energie', label: 'Énergie', description: 'Consommations énergétiques' },
  { value: 'satisfaction', label: 'Satisfaction', description: 'Enquêtes locataires/visiteurs' },
];

const statutColors: Record<string, string> = {
  succes: 'bg-success/10 text-success',
  partiel: 'bg-warning/10 text-warning',
  echec: 'bg-error/10 text-error',
};

const statutLabels: Record<string, string> = {
  succes: 'Terminé',
  partiel: 'Partiel',
  echec: 'Erreur',
};

export function ImportPage() {
  const { centreId } = useParams<{ centreId: string }>();
  const centre = useCentresStore((state) => state.getCentre(centreId || ''));
  const { addToast } = useAppStore();

  const {
    fichiers = [],
    dossiers = [],
    importEnCours = { etape: 'upload', progression: 0, fichierParse: null, categorie: null, mapping: [], validation: null, donneesTransformees: [], erreur: null },
    loadFichiers,
    loadDossiers,
    uploadFichier,
    setCategorie,
    setMapping,
    valider,
    importerDonnees,
    resetImport,
    creerDossier,
  } = useImportStore();

  const [etapeActive, setEtapeActive] = useState<number>(1);
  const [categorieSelectionnee, setCategorieSelectionnee] = useState<CategorieImport>('etat_locatif');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalDossierOpen, setIsModalDossierOpen] = useState(false);
  const [nouveauDossierNom, setNouveauDossierNom] = useState('');
  const [dossierActif, setDossierActif] = useState<string | null>(null);

  // Charger les fichiers et dossiers au montage
  useEffect(() => {
    if (centreId) {
      loadFichiers(centreId);
      loadDossiers(centreId);
    }
  }, [centreId, loadFichiers, loadDossiers]);

  // Synchroniser l'étape avec l'état d'import
  useEffect(() => {
    if (importEnCours.etape === 'mapping') {
      setEtapeActive(2);
    } else if (importEnCours.etape === 'validation') {
      setEtapeActive(3);
    } else if (importEnCours.etape === 'import' || importEnCours.etape === 'termine') {
      setEtapeActive(4);
    }
  }, [importEnCours.etape]);

  // Gestion du drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileSelect(files[0]);
    }
  }, [categorieSelectionnee]);

  const handleFileSelect = async (file: File) => {
    if (!centreId) return;

    try {
      // Définir la catégorie avant l'upload
      setCategorie(categorieSelectionnee);
      await uploadFichier(file);
      addToast({ type: 'success', title: 'Fichier chargé', message: `${file.name} analysé avec succès` });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileSelect(files[0]);
    }
  };

  const handleValider = () => {
    try {
      valider();

      if (importEnCours.validation && importEnCours.validation.valide) {
        addToast({ type: 'success', title: 'Validation réussie', message: 'Les données sont prêtes à être importées' });
      } else if (importEnCours.validation) {
        addToast({ type: 'warning', title: 'Validation avec avertissements', message: `${importEnCours.validation.erreurs.length} erreur(s) détectée(s)` });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur de validation', message: String(error) });
    }
  };

  const handleImporter = async () => {
    if (!centreId) return;

    try {
      const result = await importerDonnees(centreId, dossierActif || undefined);
      if (result) {
        addToast({ type: 'success', title: 'Import terminé', message: 'Les données ont été importées avec succès' });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur d\'import', message: String(error) });
    }
  };

  const handleReinitialiser = () => {
    resetImport();
    setEtapeActive(1);
  };

  const handleCreerDossier = async () => {
    if (!centreId || !nouveauDossierNom) return;

    try {
      await creerDossier({
        centreId,
        nom: nouveauDossierNom,
        ordre: dossiers.length,
      });
      setIsModalDossierOpen(false);
      setNouveauDossierNom('');
      addToast({ type: 'success', title: 'Dossier créé' });
    } catch (error) {
      addToast({ type: 'error', title: 'Erreur', message: String(error) });
    }
  };

  const etapes = [
    { num: 1, titre: 'Sélection', description: 'Choisir fichier et catégorie' },
    { num: 2, titre: 'Mapping', description: 'Associer les colonnes' },
    { num: 3, titre: 'Validation', description: 'Vérifier les données' },
    { num: 4, titre: 'Import', description: 'Finaliser l\'import' },
  ];

  // Filtrer les fichiers par dossier
  const fichiersFiltres = dossierActif
    ? fichiers.filter(f => f.dossierId === dossierActif)
    : fichiers;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Import de données</h1>
          <p className="text-primary-500 mt-1">{centre?.nom}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<FolderOpen className="w-4 h-4" />}
            onClick={() => setIsModalDossierOpen(true)}
          >
            Nouveau dossier
          </Button>
          {importEnCours.fichierParse && (
            <Button variant="ghost" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={handleReinitialiser}>
              Recommencer
            </Button>
          )}
        </div>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-primary-200">
        {etapes.map((etape, index) => (
          <React.Fragment key={etape.num}>
            <div
              className={`flex items-center gap-3 cursor-pointer ${
                etapeActive >= etape.num ? 'text-accent' : 'text-primary-400'
              }`}
              onClick={() => etapeActive > etape.num && setEtapeActive(etape.num)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  etapeActive > etape.num
                    ? 'bg-success text-white'
                    : etapeActive === etape.num
                    ? 'bg-accent text-white'
                    : 'bg-primary-100 text-primary-400'
                }`}
              >
                {etapeActive > etape.num ? <CheckCircle className="w-5 h-5" /> : etape.num}
              </div>
              <div>
                <div className="font-medium">{etape.titre}</div>
                <div className="text-xs text-primary-500">{etape.description}</div>
              </div>
            </div>
            {index < etapes.length - 1 && (
              <ChevronRight className="w-5 h-5 text-primary-300 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Zone principale */}
        <div className="col-span-2 space-y-6">
          {/* Étape 1: Sélection du fichier */}
          {etapeActive === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Sélection du fichier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sélection catégorie */}
                <div>
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Catégorie de données
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES_IMPORT.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setCategorieSelectionnee(cat.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          categorieSelectionnee === cat.value
                            ? 'border-accent bg-accent/5 ring-2 ring-accent/20'
                            : 'border-primary-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-medium text-primary-900">{cat.label}</div>
                        <div className="text-xs text-primary-500">{cat.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zone de drop */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                    isDragOver
                      ? 'border-accent bg-accent/5'
                      : 'border-primary-300 hover:border-primary-400'
                  }`}
                >
                  <Upload className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                  <p className="text-primary-600 mb-2">
                    Glissez-déposez votre fichier ici
                  </p>
                  <p className="text-sm text-primary-500 mb-4">
                    ou
                  </p>
                  <label>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <Button as="span" leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
                      Parcourir les fichiers
                    </Button>
                  </label>
                  <p className="text-xs text-primary-400 mt-4">
                    Formats acceptés: Excel (.xlsx, .xls), CSV, JSON
                  </p>
                </div>

                {/* Erreur de chargement */}
                {importEnCours.erreur && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                    <div className="flex items-center gap-2 text-error">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Erreur</span>
                    </div>
                    <p className="mt-1 text-sm text-primary-700">{importEnCours.erreur}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Étape 2: Mapping des colonnes */}
          {etapeActive === 2 && importEnCours.fichierParse && (
            <Card>
              <CardHeader>
                <CardTitle>Mapping des colonnes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-primary-500" />
                    <span className="font-medium">{importEnCours.fichierParse.nom}</span>
                    <span className="text-primary-500">
                      ({importEnCours.fichierParse.lignesTotal} lignes, {importEnCours.fichierParse.colonnes.length} colonnes)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-primary-600 pb-2 border-b">
                    <div>Colonne source</div>
                    <div>Champ cible</div>
                    <div>Statut</div>
                  </div>

                  {importEnCours.mapping.map((m, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-primary-100">
                      <div className="font-mono text-sm bg-primary-50 px-2 py-1 rounded">
                        {m.colonneSource}
                      </div>
                      <div className="text-sm text-primary-700">
                        {m.champCible || '— Non mappé —'}
                      </div>
                      <div>
                        {m.champCible ? (
                          <Badge className="bg-success/10 text-success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mappé
                          </Badge>
                        ) : (
                          <Badge className="bg-primary-100 text-primary-500">
                            Ignoré
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleValider}>
                    Valider les données
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 3: Validation */}
          {etapeActive === 3 && importEnCours.validation && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Résultat de la validation</CardTitle>
                  <Badge className={importEnCours.validation.valide ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}>
                    {importEnCours.validation.valide ? 'Valide' : 'Erreurs détectées'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats de validation */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-success/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-success">{importEnCours.validation.lignesValides}</div>
                    <div className="text-sm text-primary-600">Lignes valides</div>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-warning">{importEnCours.validation.avertissements?.length || 0}</div>
                    <div className="text-sm text-primary-600">Avertissements</div>
                  </div>
                  <div className="p-4 bg-error/10 rounded-lg text-center">
                    <div className="text-2xl font-bold text-error">{importEnCours.validation.erreurs.length}</div>
                    <div className="text-sm text-primary-600">Erreurs</div>
                  </div>
                </div>

                {/* Liste des erreurs */}
                {importEnCours.validation.erreurs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-error mb-3">Erreurs</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {importEnCours.validation.erreurs.slice(0, 20).map((err, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-error/5 rounded text-sm">
                          <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-primary-500">Ligne {err.ligne}, colonne "{err.colonne}":</span>{' '}
                            <span className="text-primary-700">{err.message}</span>
                          </div>
                        </div>
                      ))}
                      {importEnCours.validation.erreurs.length > 20 && (
                        <div className="text-sm text-primary-500 text-center py-2">
                          ... et {importEnCours.validation.erreurs.length - 20} autres erreurs
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button variant="secondary" onClick={() => setEtapeActive(2)}>
                    Retour au mapping
                  </Button>
                  <Button
                    onClick={handleImporter}
                    disabled={!importEnCours.validation.valide && importEnCours.validation.erreurs.length > 0}
                  >
                    Importer les données
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Étape 4: Import terminé */}
          {etapeActive === 4 && importEnCours.etape === 'termine' && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">Import réussi !</h3>
                <p className="text-primary-600 mb-6">
                  Les données ont été importées avec succès dans la base.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={handleReinitialiser}>
                    Nouvel import
                  </Button>
                  <Button leftIcon={<Database className="w-4 h-4" />}>
                    Voir les données
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progression en cours d'import */}
          {etapeActive === 4 && importEnCours.etape === 'import' && (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Database className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-2">Import en cours...</h3>
                <div className="max-w-xs mx-auto mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-primary-600">Progression</span>
                    <span className="font-medium">{importEnCours.progression}%</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importEnCours.progression}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panneau latéral */}
        <div className="space-y-6">
          {/* Dossiers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dossiers d'import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => setDossierActif(null)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg text-left ${
                    !dossierActif ? 'bg-accent/10 text-accent' : 'hover:bg-primary-50'
                  }`}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm">Tous les imports</span>
                  <Badge className="ml-auto text-xs">{fichiers.length}</Badge>
                </button>
                {dossiers.map((dossier) => {
                  const dossierFichiers = fichiers.filter(f => f.dossierId === dossier.id);
                  return (
                    <button
                      key={dossier.id}
                      onClick={() => setDossierActif(dossier.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left ${
                        dossierActif === dossier.id ? 'bg-accent/10 text-accent' : 'hover:bg-primary-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        <span className="text-sm">{dossier.nom}</span>
                      </div>
                      <Badge className="text-xs">{dossierFichiers.length}</Badge>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Historique récent */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique récent</CardTitle>
            </CardHeader>
            <CardContent>
              {fichiersFiltres.length === 0 ? (
                <p className="text-sm text-primary-500 text-center py-4">
                  Aucun import récent
                </p>
              ) : (
                <div className="space-y-3">
                  {fichiersFiltres.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-2 bg-primary-50 rounded-lg">
                      <FileSpreadsheet className="w-4 h-4 text-primary-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-primary-900 truncate">
                          {item.nom}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-primary-500">
                          <Clock className="w-3 h-3" />
                          {new Date(item.dateImport).toLocaleDateString('fr-FR')}
                          <Badge className={`${statutColors[item.statut] || 'bg-primary-100 text-primary-700'} text-xs`}>
                            {statutLabels[item.statut] || item.statut}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progression en cours */}
          {importEnCours.etape === 'import' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-600">Progression</span>
                    <span className="font-medium">{importEnCours.progression}%</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importEnCours.progression}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal création dossier */}
      <Modal
        isOpen={isModalDossierOpen}
        onClose={() => setIsModalDossierOpen(false)}
        title="Nouveau dossier d'import"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalDossierOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreerDossier} disabled={!nouveauDossierNom}>
              Créer
            </Button>
          </>
        }
      >
        <Input
          label="Nom du dossier"
          value={nouveauDossierNom}
          onChange={(e) => setNouveauDossierNom(e.target.value)}
          placeholder="Ex: Import Q1 2024"
        />
      </Modal>
    </div>
  );
}

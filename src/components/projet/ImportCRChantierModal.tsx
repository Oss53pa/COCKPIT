/**
 * Modal d'import des Comptes-Rendus de Reunion Chantier (PDF)
 * Permet d'extraire automatiquement les informations de jalons a partir des CR
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Flag,
  Clock,
  AlertCircle,
  Sparkles,
  Eye,
  Check,
  RefreshCw,
  FileWarning,
} from 'lucide-react';
import { Modal, Button, Badge, Input } from '../ui';
import { useProjetStore, useAppStore } from '../../store';
import { useAIStore } from '../../store/aiStore';
import { sendChatCompletion } from '../../services/aiService';
import * as pdfjsLib from 'pdfjs-dist';
import type { Jalon, StatutJalon } from '../../types';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  centreId: string;
}

interface ExtractedMilestoneUpdate {
  id: string;
  jalonId?: string;
  jalonTitre?: string;
  type: 'update' | 'new' | 'info';
  field: string;
  oldValue?: string;
  newValue: string;
  confidence: 'high' | 'medium' | 'low';
  source: string;
  selected: boolean;
}

interface ParsedMeetingInfo {
  date?: string;
  numero?: string;
  phase?: string;
  participants?: string[];
  summary?: string;
}

type ImportStep = 'upload' | 'extracting' | 'analyzing' | 'review' | 'applying' | 'done';

export function ImportCRChantierModal({ isOpen, onClose, centreId }: Props) {
  const { addToast } = useAppStore();
  const { jalons, updateJalon, addJalon } = useProjetStore();
  const { selectedProvider, apiKey, selectedModel } = useAIStore();

  const [step, setStep] = useState<ImportStep>('upload');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [meetingInfo, setMeetingInfo] = useState<ParsedMeetingInfo | null>(null);
  const [updates, setUpdates] = useState<ExtractedMilestoneUpdate[]>([]);
  const [error, setError] = useState<string>('');
  const [showRawText, setShowRawText] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  const handleClose = () => {
    setStep('upload');
    setPdfFile(null);
    setExtractedText('');
    setMeetingInfo(null);
    setUpdates([]);
    setError('');
    setShowRawText(false);
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Veuillez selectionner un fichier PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier ne doit pas depasser 10 Mo');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Veuillez selectionner un fichier PDF');
        return;
      }
      setPdfFile(file);
      setError('');
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // Extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
      setProgress((i / pdf.numPages) * 50);
    }

    return fullText;
  };

  // Analyze text with AI
  const analyzeWithAI = async (text: string): Promise<{
    meetingInfo: ParsedMeetingInfo;
    updates: ExtractedMilestoneUpdate[];
  }> => {
    if (!apiKey || !selectedModel) {
      throw new Error('Configuration IA requise. Veuillez configurer une cle API dans les Parametres.');
    }

    const jalonsList = jalons || [];
    const jalonsContext = jalonsList.length > 0
      ? `Jalons existants du projet:\n${jalonsList.map(j =>
          `- ID: ${j.id}, Code: ${j.code || 'N/A'}, Titre: ${j.titre}, Statut: ${j.statut}, Date cible: ${j.dateCible}, Avancement: ${j.progression || 0}%`
        ).join('\n')}`
      : 'Aucun jalon existant dans le projet.';

    const systemPrompt = `Tu es un assistant specialise dans l'analyse de comptes-rendus de reunion chantier pour des projets de construction de centres commerciaux.

Ta tache est d'extraire les informations pertinentes pour mettre a jour les jalons du projet.

${jalonsContext}

Reponds UNIQUEMENT en JSON valide avec la structure suivante:
{
  "meetingInfo": {
    "date": "YYYY-MM-DD ou null",
    "numero": "numero de la reunion ou null",
    "phase": "phase du projet ou null",
    "participants": ["liste", "des", "participants"],
    "summary": "resume court de la reunion"
  },
  "updates": [
    {
      "jalonId": "ID du jalon existant a mettre a jour ou null si nouveau",
      "jalonTitre": "Titre du jalon concerne",
      "type": "update|new|info",
      "field": "nom du champ (statut, progression, dateCible, dateReelle, commentaire)",
      "oldValue": "ancienne valeur si update",
      "newValue": "nouvelle valeur extraite",
      "confidence": "high|medium|low",
      "source": "extrait du texte source"
    }
  ]
}

Pour les mises a jour de statut, utilise: a_venir, en_cours, en_retard, a_risque, atteint, reporte
Pour la progression, utilise un pourcentage (ex: "75")
Pour les dates, utilise le format YYYY-MM-DD`;

    const userPrompt = `Analyse ce compte-rendu de reunion chantier et extrait les informations pour mettre a jour les jalons:

${text.slice(0, 15000)}

Identifie:
1. Les informations generales de la reunion (date, numero, phase)
2. Les mises a jour de jalons existants (avancement, retards, problemes)
3. Les nouveaux jalons mentionnes
4. Les dates cles et echeances

Reponds uniquement en JSON valide.`;

    setProgress(60);

    const result = await sendChatCompletion(
      selectedProvider,
      apiKey,
      selectedModel,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 4096 }
    );

    setProgress(80);

    if (!result.success) {
      throw new Error(result.error || 'Erreur lors de l\'analyse IA');
    }

    // Parse JSON response
    let parsedResult;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = result.content?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Reponse JSON invalide');
      }
    } catch (e) {
      console.error('JSON parse error:', e, result.content);
      throw new Error('Impossible de parser la reponse de l\'IA');
    }

    // Add IDs and selection state to updates
    const updatesWithIds: ExtractedMilestoneUpdate[] = (parsedResult.updates || []).map(
      (u: any, index: number) => ({
        ...u,
        id: `update-${index}`,
        selected: u.confidence === 'high',
      })
    );

    return {
      meetingInfo: parsedResult.meetingInfo || {},
      updates: updatesWithIds,
    };
  };

  // Process PDF
  const processPDF = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setError('');
    setProgress(0);

    try {
      // Step 1: Extract text
      setStep('extracting');
      const text = await extractTextFromPDF(pdfFile);
      setExtractedText(text);

      if (text.trim().length < 100) {
        throw new Error('Le PDF semble vide ou non lisible. Verifiez qu\'il contient du texte selectionnable.');
      }

      // Step 2: Analyze with AI
      setStep('analyzing');
      const { meetingInfo: info, updates: extractedUpdates } = await analyzeWithAI(text);
      setMeetingInfo(info);
      setUpdates(extractedUpdates);

      setProgress(100);
      setStep('review');
    } catch (err: any) {
      console.error('PDF processing error:', err);
      setError(err.message || 'Erreur lors du traitement du PDF');
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle update selection
  const toggleUpdateSelection = (id: string) => {
    setUpdates(prev =>
      prev.map(u => (u.id === id ? { ...u, selected: !u.selected } : u))
    );
  };

  // Apply selected updates
  const applyUpdates = async () => {
    const selectedUpdates = updates.filter(u => u.selected);
    if (selectedUpdates.length === 0) {
      addToast({ type: 'warning', message: 'Aucune mise a jour selectionnee' });
      return;
    }

    setStep('applying');
    setIsProcessing(true);

    try {
      for (const update of selectedUpdates) {
        if (update.type === 'update' && update.jalonId) {
          // Update existing jalon
          const updateData: Partial<Jalon> = {};

          switch (update.field) {
            case 'statut':
              updateData.statut = update.newValue as StatutJalon;
              break;
            case 'progression':
              updateData.progression = parseInt(update.newValue) || 0;
              break;
            case 'dateCible':
            case 'dateReelle':
            case 'datePrevision':
              updateData[update.field] = update.newValue;
              break;
            case 'commentaire':
              updateData.commentaire = update.newValue;
              break;
          }

          // Add CR reference to notes
          const crRef = meetingInfo?.date
            ? `[CR ${meetingInfo.numero || ''} du ${meetingInfo.date}] `
            : '[Import CR] ';
          updateData.notes = crRef + (update.source || '');

          await updateJalon(update.jalonId, updateData);
        } else if (update.type === 'new') {
          // Create new jalon
          await addJalon({
            centreId,
            code: `CR-${Date.now().toString(36).toUpperCase()}`,
            titre: update.jalonTitre || update.newValue,
            description: update.source || '',
            type: 'checkpoint',
            categorie: 'technique',
            importance: 'normal',
            statut: 'a_venir',
            dateCible: meetingInfo?.date || new Date().toISOString().split('T')[0],
            progression: 0,
            visible: true,
          });
        }
      }

      setStep('done');
      addToast({
        type: 'success',
        title: 'Import reussi',
        message: `${selectedUpdates.length} mise(s) a jour appliquee(s)`,
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'application des mises a jour');
      setStep('review');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                pdfFile
                  ? 'border-success bg-success/5'
                  : 'border-primary-300 hover:border-accent hover:bg-accent/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {pdfFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                  <p className="font-medium text-primary-900">{pdfFile.name}</p>
                  <p className="text-sm text-primary-500">
                    {(pdfFile.size / 1024).toFixed(1)} Ko
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfFile(null);
                    }}
                  >
                    Changer de fichier
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-primary-300 mx-auto" />
                  <p className="font-medium text-primary-900">
                    Deposez votre compte-rendu PDF ici
                  </p>
                  <p className="text-sm text-primary-500">
                    ou cliquez pour selectionner un fichier
                  </p>
                  <p className="text-xs text-primary-400">PDF uniquement, max 10 Mo</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* AI Configuration warning */}
            {(!apiKey || !selectedModel) && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Configuration IA requise</p>
                  <p className="text-xs text-primary-600">
                    Configurez une cle API dans les Parametres pour activer l'analyse automatique.
                  </p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    Analyse automatique par IA
                  </p>
                  <p className="text-xs text-primary-600 mt-1">
                    L'IA va extraire automatiquement les informations de votre compte-rendu :
                    avancements, retards, dates cles, problemes identifies. Vous pourrez
                    verifier et valider chaque mise a jour avant application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'extracting':
      case 'analyzing':
        return (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
            <div>
              <p className="font-medium text-primary-900">
                {step === 'extracting' ? 'Extraction du texte...' : 'Analyse par l\'IA...'}
              </p>
              <p className="text-sm text-primary-500 mt-1">
                {step === 'extracting'
                  ? 'Lecture du document PDF'
                  : 'Identification des mises a jour de jalons'}
              </p>
            </div>
            <div className="w-64 mx-auto">
              <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-primary-400 mt-1">{progress}%</p>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            {/* Meeting Info */}
            {meetingInfo && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <h4 className="font-medium text-primary-900 mb-2">Informations de la reunion</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {meetingInfo.date && (
                    <div>
                      <span className="text-primary-500">Date:</span>{' '}
                      <span className="text-primary-900">{meetingInfo.date}</span>
                    </div>
                  )}
                  {meetingInfo.numero && (
                    <div>
                      <span className="text-primary-500">Numero:</span>{' '}
                      <span className="text-primary-900">{meetingInfo.numero}</span>
                    </div>
                  )}
                  {meetingInfo.phase && (
                    <div className="col-span-2">
                      <span className="text-primary-500">Phase:</span>{' '}
                      <span className="text-primary-900">{meetingInfo.phase}</span>
                    </div>
                  )}
                </div>
                {meetingInfo.summary && (
                  <p className="text-sm text-primary-600 mt-2 italic">
                    {meetingInfo.summary}
                  </p>
                )}
              </div>
            )}

            {/* Updates list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary-900">
                  Mises a jour detectees ({updates.length})
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setUpdates(prev => prev.map(u => ({ ...u, selected: true })))}
                  >
                    Tout selectionner
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setUpdates(prev => prev.map(u => ({ ...u, selected: false })))}
                  >
                    Tout deselectionner
                  </Button>
                </div>
              </div>

              {updates.length === 0 ? (
                <div className="p-8 text-center bg-primary-50 rounded-lg">
                  <FileWarning className="w-12 h-12 text-primary-300 mx-auto mb-2" />
                  <p className="text-primary-600">
                    Aucune mise a jour de jalon detectee dans ce document.
                  </p>
                  <p className="text-sm text-primary-500 mt-1">
                    Verifiez que le CR contient des informations sur l'avancement du chantier.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {updates.map((update) => (
                    <div
                      key={update.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        update.selected
                          ? 'border-accent bg-accent/5'
                          : 'border-primary-200 bg-white hover:border-primary-300'
                      }`}
                      onClick={() => toggleUpdateSelection(update.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            update.selected
                              ? 'border-accent bg-accent text-white'
                              : 'border-primary-300'
                          }`}
                        >
                          {update.selected && <Check className="w-3 h-3" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-primary-900">
                              {update.jalonTitre || 'Nouveau jalon'}
                            </span>
                            <Badge
                              className={
                                update.type === 'update'
                                  ? 'bg-blue-100 text-blue-700'
                                  : update.type === 'new'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-primary-100 text-primary-700'
                              }
                            >
                              {update.type === 'update'
                                ? 'Mise a jour'
                                : update.type === 'new'
                                ? 'Nouveau'
                                : 'Info'}
                            </Badge>
                            <Badge
                              className={
                                update.confidence === 'high'
                                  ? 'bg-success/10 text-success'
                                  : update.confidence === 'medium'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-error/10 text-error'
                              }
                            >
                              Confiance {update.confidence === 'high' ? 'haute' : update.confidence === 'medium' ? 'moyenne' : 'faible'}
                            </Badge>
                          </div>

                          <div className="mt-1 text-sm">
                            <span className="text-primary-500">{update.field}:</span>{' '}
                            {update.oldValue && (
                              <span className="text-primary-400 line-through mr-2">
                                {update.oldValue}
                              </span>
                            )}
                            <span className="text-primary-900 font-medium">
                              {update.newValue}
                            </span>
                          </div>

                          {update.source && (
                            <p className="text-xs text-primary-400 mt-1 italic line-clamp-2">
                              "{update.source}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Show raw text toggle */}
            <div>
              <button
                className="flex items-center gap-2 text-sm text-primary-500 hover:text-primary-700"
                onClick={() => setShowRawText(!showRawText)}
              >
                {showRawText ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                Voir le texte extrait
              </button>
              {showRawText && (
                <div className="mt-2 p-3 bg-primary-50 rounded-lg max-h-[200px] overflow-y-auto">
                  <pre className="text-xs text-primary-600 whitespace-pre-wrap">
                    {extractedText}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );

      case 'applying':
        return (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
            <p className="font-medium text-primary-900">Application des mises a jour...</p>
          </div>
        );

      case 'done':
        return (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
            <div>
              <p className="text-xl font-medium text-primary-900">Import termine !</p>
              <p className="text-primary-500 mt-1">
                {updates.filter(u => u.selected).length} mise(s) a jour appliquee(s) aux jalons.
              </p>
            </div>
          </div>
        );
    }
  };

  // Render footer buttons
  const renderFooter = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              onClick={processPDF}
              disabled={!pdfFile || !apiKey || !selectedModel}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Analyser le CR
            </Button>
          </div>
        );

      case 'extracting':
      case 'analyzing':
      case 'applying':
        return (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={handleClose}>
              Annuler
            </Button>
          </div>
        );

      case 'review':
        return (
          <div className="flex justify-between w-full">
            <Button
              variant="ghost"
              onClick={() => {
                setStep('upload');
                setPdfFile(null);
              }}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Nouveau fichier
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={applyUpdates}
                disabled={updates.filter(u => u.selected).length === 0}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Appliquer ({updates.filter(u => u.selected).length})
              </Button>
            </div>
          </div>
        );

      case 'done':
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setStep('upload');
                setPdfFile(null);
                setUpdates([]);
              }}
            >
              Importer un autre CR
            </Button>
            <Button onClick={handleClose}>Terminer</Button>
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Import Compte-Rendu Chantier
        </div>
      }
      size="lg"
      footer={renderFooter()}
    >
      {renderStepContent()}
    </Modal>
  );
}

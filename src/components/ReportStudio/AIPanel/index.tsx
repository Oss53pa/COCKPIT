/**
 * AI Panel Component
 * Right sidebar with AI insights, recommendations, and chat
 */

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Send,
  Activity,
  MessageCircle,
  Clock,
  User,
  Edit3,
  Eye,
  FileText,
  MoreVertical,
  Reply,
  Trash2,
} from 'lucide-react';
import { StudioReport, Insight, Recommendation, ReportComment } from '../../../types/reportStudio';
import { useReportStudioStore } from '../../../store/reportStudioStore';

interface AIPanelProps {
  report: StudioReport;
  selectedBlockId: string | null;
  collapsed: boolean;
  onCollapse: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  report,
  selectedBlockId,
  collapsed,
  onCollapse,
}) => {
  const { aiPanel, insights, recommendations, setAIActiveTab, addChatMessage, setAILoading } = useReportStudioStore();
  const [chatInput, setChatInput] = useState('');

  const tabs = [
    { id: 'summary' as const, label: 'Résumé', icon: Sparkles },
    { id: 'insights' as const, label: 'Insights', icon: Lightbulb },
    { id: 'recommendations' as const, label: 'Actions', icon: TrendingUp },
    { id: 'activity' as const, label: 'Activité', icon: Activity },
    { id: 'comments' as const, label: 'Commentaires', icon: MessageCircle },
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  ];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setChatInput('');
    setAILoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: `Je comprends votre question concernant "${chatInput}". Voici quelques suggestions pour améliorer votre rapport...`,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(assistantMessage);
      setAILoading(false);
    }, 1500);
  };

  if (collapsed) {
    return (
      <div className="w-12 bg-white border-l border-primary-200 flex flex-col items-center py-4">
        <button
          onClick={onCollapse}
          className="p-2 hover:bg-primary-100 rounded-lg mb-4"
          title="Développer le panneau IA"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <Sparkles className="w-5 h-5 text-purple-500" />
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-l border-primary-200 flex">
      {/* Vertical Tabs Sidebar */}
      <div className="w-14 bg-primary-50 border-r border-primary-200 flex flex-col py-2">
        {/* Collapse button */}
        <button
          onClick={onCollapse}
          className="p-2 mx-2 mb-2 hover:bg-primary-100 rounded-lg transition-colors"
          title="Réduire le panneau"
        >
          <ChevronRight className="w-5 h-5 text-primary-500" />
        </button>

        {/* Vertical Tabs */}
        <div className="flex-1 flex flex-col gap-1 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAIActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                  aiPanel.activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-primary-500 hover:bg-primary-100'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* AI Icon at bottom */}
        <div className="px-2 pt-2 border-t border-primary-200 mt-2">
          <div className="flex items-center justify-center p-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-primary-200">
          <h2 className="font-semibold text-primary-900">
            {tabs.find(t => t.id === aiPanel.activeTab)?.label || 'Assistant IA'}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
        {aiPanel.activeTab === 'summary' && (
          <SummaryTab report={report} />
        )}
        {aiPanel.activeTab === 'insights' && (
          <InsightsTab insights={insights} />
        )}
        {aiPanel.activeTab === 'recommendations' && (
          <RecommendationsTab recommendations={recommendations} />
        )}
        {aiPanel.activeTab === 'activity' && (
          <ActivityTab report={report} />
        )}
        {aiPanel.activeTab === 'comments' && (
          <CommentsTab report={report} selectedBlockId={selectedBlockId} />
        )}
        {aiPanel.activeTab === 'chat' && (
          <ChatTab
            messages={aiPanel.chatMessages}
            isLoading={aiPanel.isLoading}
            input={chatInput}
            onInputChange={setChatInput}
            onSend={handleSendMessage}
          />
        )}
        </div>
      </div>
    </div>
  );
};

// Summary Tab
const SummaryTab: React.FC<{ report: StudioReport }> = ({ report }) => (
  <div className="space-y-4">
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
      <h3 className="font-medium text-primary-900 mb-2">Résumé du rapport</h3>
      <p className="text-sm text-primary-600">
        Ce rapport "{report.title}" contient une analyse complète des données.
        Il est actuellement en statut: <span className="font-medium">{report.status}</span>
      </p>
    </div>

    <div className="bg-primary-50 rounded-xl p-4">
      <h4 className="font-medium text-primary-900 mb-2">Statistiques</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-primary-500">Version</span>
          <p className="font-medium">{report.version}</p>
        </div>
        <div>
          <span className="text-primary-500">Créé le</span>
          <p className="font-medium">
            {new Date(report.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Insights Tab
const InsightsTab: React.FC<{ insights: Insight[] }> = ({ insights }) => (
  <div className="space-y-3">
    {insights.length === 0 ? (
      <div className="text-center py-8 text-primary-400">
        <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun insight disponible</p>
      </div>
    ) : (
      insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))
    )}
  </div>
);

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
  const typeStyles = {
    positive: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    negative: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    warning: { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    info: { icon: Lightbulb, color: 'text-blue-500', bg: 'bg-blue-50' },
    opportunity: { icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
  };

  const style = typeStyles[insight.type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} rounded-lg p-3`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${style.color} flex-shrink-0 mt-0.5`} />
        <div>
          <h4 className="font-medium text-primary-900 text-sm">{insight.title}</h4>
          <p className="text-xs text-primary-600 mt-1">{insight.description}</p>
          {insight.value && (
            <p className={`text-sm font-bold ${style.color} mt-1`}>{insight.value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Recommendations Tab
const RecommendationsTab: React.FC<{ recommendations: Recommendation[] }> = ({ recommendations }) => (
  <div className="space-y-3">
    {recommendations.length === 0 ? (
      <div className="text-center py-8 text-primary-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucune recommandation</p>
      </div>
    ) : (
      recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))
    )}
  </div>
);

const RecommendationCard: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
  const priorityColors = {
    critical: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-blue-300 bg-blue-50',
  };

  return (
    <div className={`border rounded-lg p-3 ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-primary-900 text-sm">{recommendation.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          recommendation.priority === 'critical' ? 'bg-red-200 text-red-700' :
          recommendation.priority === 'high' ? 'bg-orange-200 text-orange-700' :
          recommendation.priority === 'medium' ? 'bg-yellow-200 text-yellow-700' :
          'bg-blue-200 text-blue-700'
        }`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-xs text-primary-600 mt-1">{recommendation.description}</p>
      <button className="mt-2 text-xs text-primary hover:underline flex items-center gap-1">
        Appliquer <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

// Chat Tab
interface ChatTabProps {
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: string }>;
  isLoading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  isLoading,
  input,
  onInputChange,
  onSend,
}) => (
  <div className="flex flex-col h-full">
    {/* Messages */}
    <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-primary-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Posez une question à l'assistant IA</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-primary text-white ml-8'
                : 'bg-primary-100 text-primary-900 mr-8'
            }`}
          >
            <p className="text-sm">{msg.content}</p>
          </div>
        ))
      )}
      {isLoading && (
        <div className="bg-primary-100 text-primary-900 p-3 rounded-lg mr-8">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>

    {/* Input */}
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Posez votre question..."
        className="flex-1 px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={onSend}
        disabled={!input.trim() || isLoading}
        className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Activity Tab
interface ActivityItem {
  id: string;
  type: 'edit' | 'view' | 'comment' | 'export' | 'status_change';
  user: string;
  description: string;
  timestamp: string;
  details?: string;
}

const ActivityTab: React.FC<{ report: StudioReport }> = ({ report }) => {
  // Mock activity data based on report info
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'edit',
      user: report.author,
      description: 'A modifié le rapport',
      timestamp: report.updatedAt,
      details: 'Mise à jour du contenu',
    },
    {
      id: '2',
      type: 'view',
      user: 'Marie Dupont',
      description: 'A consulté le rapport',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'status_change',
      user: report.author,
      description: 'Statut modifié',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      details: `Changé en "${report.status}"`,
    },
    {
      id: '4',
      type: 'comment',
      user: 'Jean Martin',
      description: 'A ajouté un commentaire',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      details: 'Section "Analyse"',
    },
    {
      id: '5',
      type: 'edit',
      user: report.author,
      description: 'A créé le rapport',
      timestamp: report.createdAt,
    },
  ];

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'edit':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'view':
        return <Eye className="w-4 h-4 text-gray-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'export':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'status_change':
        return <Activity className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-primary-900 text-sm">Activité récente</h3>
        <span className="text-xs text-primary-400">{activities.length} actions</span>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-2 bottom-2 w-px bg-primary-200" />

        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex gap-3 pl-2">
              {/* Icon */}
              <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-primary-200 flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-primary-900 truncate">
                    {activity.user}
                  </span>
                  <span className="text-xs text-primary-400">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-primary-600">{activity.description}</p>
                {activity.details && (
                  <p className="text-xs text-primary-400 mt-0.5">{activity.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Comments Tab
interface CommentState {
  comments: ReportComment[];
  newComment: string;
  replyingTo: string | null;
  replyText: string;
}

const CommentsTab: React.FC<{ report: StudioReport; selectedBlockId: string | null }> = ({
  report,
  selectedBlockId,
}) => {
  const [state, setState] = useState<CommentState>({
    comments: [
      {
        id: 'c1',
        reportId: report.id,
        blockId: 'block-1',
        content: 'Cette section nécessite plus de détails sur les KPIs.',
        isResolved: false,
        author: { id: 'u1', name: 'Marie Dupont', avatar: '' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [
          {
            id: 'c1-r1',
            reportId: report.id,
            blockId: 'block-1',
            content: 'Je vais ajouter les données manquantes.',
            isResolved: false,
            author: { id: 'u2', name: report.author, avatar: '' },
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          },
        ],
      },
      {
        id: 'c2',
        reportId: report.id,
        blockId: 'block-2',
        content: 'Le graphique devrait utiliser une échelle logarithmique.',
        isResolved: true,
        author: { id: 'u3', name: 'Jean Martin', avatar: '' },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'c3',
        reportId: report.id,
        blockId: selectedBlockId || 'block-3',
        content: 'Excellent travail sur cette analyse !',
        isResolved: false,
        author: { id: 'u4', name: 'Sophie Bernard', avatar: '' },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    newComment: '',
    replyingTo: null,
    replyText: '',
  });

  const handleAddComment = () => {
    if (!state.newComment.trim()) return;

    const newComment: ReportComment = {
      id: `c-${Date.now()}`,
      reportId: report.id,
      blockId: selectedBlockId || '',
      content: state.newComment,
      isResolved: false,
      author: { id: 'current', name: report.author, avatar: '' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      comments: [newComment, ...prev.comments],
      newComment: '',
    }));
  };

  const handleReply = (commentId: string) => {
    if (!state.replyText.trim()) return;

    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...(c.replies || []),
                {
                  id: `r-${Date.now()}`,
                  reportId: report.id,
                  blockId: c.blockId,
                  content: state.replyText,
                  isResolved: false,
                  author: { id: 'current', name: report.author, avatar: '' },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            }
          : c
      ),
      replyingTo: null,
      replyText: '',
    }));
  };

  const toggleResolved = (commentId: string) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
      ),
    }));
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const unresolvedCount = state.comments.filter((c) => !c.isResolved).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-primary-900 text-sm">Commentaires</h3>
          {unresolvedCount > 0 && (
            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
              {unresolvedCount} non résolu{unresolvedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* New comment input */}
      <div className="space-y-2">
        <textarea
          value={state.newComment}
          onChange={(e) => setState((prev) => ({ ...prev, newComment: e.target.value }))}
          placeholder={selectedBlockId ? 'Commenter ce bloc...' : 'Ajouter un commentaire...'}
          className="w-full px-3 py-2 border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          rows={2}
        />
        <button
          onClick={handleAddComment}
          disabled={!state.newComment.trim()}
          className="w-full px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Commenter
        </button>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {state.comments.length === 0 ? (
          <div className="text-center py-8 text-primary-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun commentaire</p>
          </div>
        ) : (
          state.comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg border ${
                comment.isResolved
                  ? 'border-green-200 bg-green-50/50'
                  : 'border-primary-200 bg-white'
              }`}
            >
              {/* Comment header */}
              <div className="flex items-start justify-between p-3 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-900">
                      {comment.author.name}
                    </p>
                    <p className="text-xs text-primary-400">
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleResolved(comment.id)}
                    className={`p-1 rounded transition-colors ${
                      comment.isResolved
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-primary-400 hover:bg-primary-100'
                    }`}
                    title={comment.isResolved ? 'Marquer non résolu' : 'Marquer résolu'}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-primary-400 hover:bg-primary-100 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Comment content */}
              <div className="px-3 pb-2">
                <p className={`text-sm ${comment.isResolved ? 'text-primary-500' : 'text-primary-700'}`}>
                  {comment.content}
                </p>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mx-3 mb-2 pl-3 border-l-2 border-primary-200 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary-700">
                          {reply.author.name}
                        </span>
                        <span className="text-xs text-primary-400">
                          {formatTimeAgo(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-primary-600">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {state.replyingTo === comment.id ? (
                <div className="px-3 pb-3 space-y-2">
                  <input
                    type="text"
                    value={state.replyText}
                    onChange={(e) => setState((prev) => ({ ...prev, replyText: e.target.value }))}
                    placeholder="Répondre..."
                    className="w-full px-2 py-1 text-sm border border-primary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!state.replyText.trim()}
                      className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50"
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => setState((prev) => ({ ...prev, replyingTo: null, replyText: '' }))}
                      className="px-2 py-1 text-xs text-primary-600 hover:bg-primary-100 rounded"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 pb-2">
                  <button
                    onClick={() => setState((prev) => ({ ...prev, replyingTo: comment.id }))}
                    className="text-xs text-primary-500 hover:text-primary flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Répondre
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

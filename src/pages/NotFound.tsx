/**
 * Page 404 - Not Found
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Illustration */}
        <div className="relative mb-8">
          <div className="text-9xl font-bold text-gray-200 dark:text-gray-700 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page introuvable
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </Link>

          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Page précédente
          </button>
        </div>

        {/* Suggestions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <HelpCircle className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Suggestions
            </span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Vérifiez l'URL dans la barre d'adresse</li>
            <li>• Utilisez le menu de navigation</li>
            <li>
              • Accédez à la{' '}
              <Link to="/" className="text-primary-600 hover:underline">
                page d'accueil
              </Link>
            </li>
            <li>
              • Consultez vos{' '}
              <Link to="/centres" className="text-primary-600 hover:underline">
                centres commerciaux
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

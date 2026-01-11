import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from './Toast';
import { AIAssistant } from '../AI';
import { useAppStore } from '../../store';

export function Layout() {
  const { sidebarOpen, isLoading, loadingMessage } = useAppStore();

  return (
    <div className="min-h-screen bg-primary-50">
      <Sidebar />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}
      >
        <Header />

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <Toast />

      {/* Assistant IA */}
      <AIAssistant />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white rounded-card p-6 shadow-xl flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-900 rounded-full animate-spin" />
            <span className="text-primary-900 font-medium">
              {loadingMessage || 'Chargement...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

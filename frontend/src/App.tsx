import React, { useState } from 'react';
import { Shield, Database, BarChart3 } from 'lucide-react';
import { useContract } from './hooks/useContract';
import WalletConnect from './components/WalletConnect';
import OracleManagement from './components/OracleManagement';
import FinalityDashboard from './components/FinalityDashboard';
import './App.css';

type TabType = 'dashboard' | 'oracles';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const {
    account,
    isOwner,
    loading,
    connectWallet,
    addOracle,
    removeOracle,
    getOracleInfo,
    getActiveOracles,
    submitFinalityProof,
    verifyFinality,
    getFinalityProof,
    getVersion
  } = useContract();

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Finality Dashboard', icon: BarChart3 },
    { id: 'oracles' as TabType, name: 'Oracle Management', icon: Database }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Finality Oracle</h1>
                <p className="text-sm text-gray-500">v2.0.0 Dashboard</p>
              </div>
            </div>
            
            {/* Network Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Hardhat Local</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Connection */}
        <WalletConnect
          account={account}
          isOwner={isOwner}
          loading={loading}
          onConnect={connectWallet}
        />

        {account && (
          <>
            {/* Navigation Tabs */}
            <div className="bg-white shadow-sm rounded-lg mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'dashboard' && (
                <FinalityDashboard
                  account={account}
                  submitFinalityProof={submitFinalityProof}
                  verifyFinality={verifyFinality}
                  getFinalityProof={getFinalityProof}
                  getActiveOracles={getActiveOracles}
                />
              )}

              {activeTab === 'oracles' && (
                <OracleManagement
                  account={account}
                  isOwner={isOwner}
                  loading={loading}
                  addOracle={addOracle}
                  removeOracle={removeOracle}
                  getOracleInfo={getOracleInfo}
                  getActiveOracles={getActiveOracles}
                />
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Finality Oracle v2.0.0 • Contract: 0x5FbDB...0aa3 • 
            <a 
              href="https://github.com" 
              className="text-blue-600 hover:text-blue-800 ml-1"
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

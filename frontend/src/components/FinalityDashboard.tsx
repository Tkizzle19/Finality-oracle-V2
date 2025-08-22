import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Search, FileCheck, TrendingUp, Activity } from 'lucide-react';
import { FinalityProof } from '../hooks/useContract';

interface FinalityDashboardProps {
  account: string;
  submitFinalityProof: (
    txHash: string,
    timestamp: number,
    status: number,
    slaTarget: number,
    chainId: number,
    confirmations: number
  ) => Promise<any>;
  verifyFinality: (txHash: string) => Promise<boolean>;
  getFinalityProof: (txHash: string) => Promise<FinalityProof>;
  getActiveOracles: () => Promise<string[]>;
}

const FinalityDashboard: React.FC<FinalityDashboardProps> = ({
  account,
  submitFinalityProof,
  verifyFinality,
  getFinalityProof,
  getActiveOracles
}) => {
  const [searchTxHash, setSearchTxHash] = useState('');
  const [searchResult, setSearchResult] = useState<FinalityProof | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOracles: 0,
    totalProofs: 0,
    averageConfirmations: 0
  });

  // Submit proof form state
  const [proofForm, setProofForm] = useState({
    txHash: '',
    chainId: '1',
    confirmations: '12',
    slaTarget: '12'
  });

  const loadStats = async () => {
    try {
      const oracles = await getActiveOracles();
      setStats(prev => ({ ...prev, totalOracles: oracles.length }));
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTxHash) return;

    setLoading(true);
    setError('');
    setSearchResult(null);
    setIsFinalized(null);

    try {
      const proof = await getFinalityProof(searchTxHash);
      if (proof.txHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        setError('Transaction not found in finality proofs');
        return;
      }

      setSearchResult(proof);
      const finalized = await verifyFinality(searchTxHash);
      setIsFinalized(finalized);
    } catch (err: any) {
      setError(err.message || 'Failed to search transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofForm.txHash || !account) return;

    setLoading(true);
    setError('');

    try {
      await submitFinalityProof(
        proofForm.txHash,
        Math.floor(Date.now() / 1000),
        1, // Status: finalized
        parseInt(proofForm.slaTarget),
        parseInt(proofForm.chainId),
        parseInt(proofForm.confirmations)
      );
      
      setProofForm({
        txHash: '',
        chainId: '1',
        confirmations: '12',
        slaTarget: '12'
      });
      
      alert('Finality proof submitted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to submit proof');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Pending</span>;
      case 1:
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Finalized</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Unknown</span>;
    }
  };

  useEffect(() => {
    if (account) {
      loadStats();
    }
  }, [account]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Oracles</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOracles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileCheck className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Proofs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProofs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Confirmations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageConfirmations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Transaction */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Search Transaction Finality</h2>
        </div>

        <form onSubmit={handleSearch} className="flex space-x-4 mb-4">
          <input
            type="text"
            value={searchTxHash}
            onChange={(e) => setSearchTxHash(e.target.value)}
            placeholder="Enter transaction hash (0x...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {searchResult && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Finality Proof Found</h3>
              <div className="flex items-center space-x-2">
                {getStatusBadge(searchResult.status)}
                {isFinalized !== null && (
                  isFinalized ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Transaction Hash:</span>
                <p className="text-gray-600 break-all">{searchResult.txHash}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Timestamp:</span>
                <p className="text-gray-600">{formatTimestamp(searchResult.timestamp)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Chain ID:</span>
                <p className="text-gray-600">{searchResult.chainId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Confirmations:</span>
                <p className="text-gray-600">{searchResult.confirmations} / {searchResult.slaTarget} (SLA)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Finality Proof */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileCheck className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Submit Finality Proof</h2>
        </div>

        <form onSubmit={handleSubmitProof} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Hash
              </label>
              <input
                type="text"
                value={proofForm.txHash}
                onChange={(e) => setProofForm({...proofForm, txHash: e.target.value})}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chain ID
              </label>
              <select
                value={proofForm.chainId}
                onChange={(e) => setProofForm({...proofForm, chainId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="1">Ethereum Mainnet</option>
                <option value="11155111">Sepolia Testnet</option>
                <option value="137">Polygon</option>
                <option value="42161">Arbitrum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmations
              </label>
              <input
                type="number"
                min="1"
                value={proofForm.confirmations}
                onChange={(e) => setProofForm({...proofForm, confirmations: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SLA Target
              </label>
              <input
                type="number"
                min="1"
                value={proofForm.slaTarget}
                onChange={(e) => setProofForm({...proofForm, slaTarget: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !account}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Finality Proof'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinalityDashboard;
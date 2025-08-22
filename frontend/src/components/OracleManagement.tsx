import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, DollarSign, Star, AlertTriangle } from 'lucide-react';
import { Oracle } from '../hooks/useContract';

interface OracleManagementProps {
  account: string;
  isOwner: boolean;
  loading: boolean;
  addOracle: (address: string, stake: string) => Promise<any>;
  removeOracle: (address: string) => Promise<any>;
  getOracleInfo: (address: string) => Promise<Oracle>;
  getActiveOracles: () => Promise<string[]>;
}

const OracleManagement: React.FC<OracleManagementProps> = ({
  account,
  isOwner,
  loading,
  addOracle,
  removeOracle,
  getOracleInfo,
  getActiveOracles
}) => {
  const [oracles, setOracles] = useState<Oracle[]>([]);
  const [newOracleAddress, setNewOracleAddress] = useState('');
  const [newOracleStake, setNewOracleStake] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadOracles = async () => {
    try {
      const activeOracleAddresses = await getActiveOracles();
      const oracleInfos = await Promise.all(
        activeOracleAddresses.map(address => getOracleInfo(address))
      );
      setOracles(oracleInfos);
    } catch (err) {
      console.error('Failed to load oracles:', err);
      setError('Failed to load oracles');
    }
  };

  const handleAddOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOracleAddress || !newOracleStake) return;

    setActionLoading(true);
    setError('');
    
    try {
      await addOracle(newOracleAddress, newOracleStake);
      setNewOracleAddress('');
      setNewOracleStake('');
      await loadOracles();
    } catch (err: any) {
      setError(err.message || 'Failed to add oracle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveOracle = async (address: string) => {
    if (!window.confirm(`Are you sure you want to remove oracle ${address}?`)) {
      return;
    }

    setActionLoading(true);
    setError('');
    
    try {
      await removeOracle(address);
      await loadOracles();
    } catch (err: any) {
      setError(err.message || 'Failed to remove oracle');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadOracles();
    }
  }, [account]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Oracle Management</h2>
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
          {oracles.length} Active
        </span>
      </div>

      {error && (
        <div className="mb-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Add Oracle Form (Owner Only) */}
      {isOwner && (
        <form onSubmit={handleAddOracle} className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Oracle</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oracle Address
              </label>
              <input
                type="text"
                value={newOracleAddress}
                onChange={(e) => setNewOracleAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stake Amount (ETH)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={newOracleStake}
                onChange={(e) => setNewOracleStake(e.target.value)}
                placeholder="1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={actionLoading || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{actionLoading ? 'Adding...' : 'Add Oracle'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Oracle List */}
      <div className="space-y-4">
        {oracles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No active oracles found</p>
          </div>
        ) : (
          oracles.map((oracle, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {oracle.oracleAddress.slice(0, 10)}...{oracle.oracleAddress.slice(-8)}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      oracle.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {oracle.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{oracle.stake} ETH Staked</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>Reputation: {oracle.reputation}</span>
                    </div>
                  </div>
                </div>
                
                {isOwner && (
                  <button
                    onClick={() => handleRemoveOracle(oracle.oracleAddress)}
                    disabled={actionLoading}
                    className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                    title="Remove Oracle"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={loadOracles}
          disabled={loading}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default OracleManagement;
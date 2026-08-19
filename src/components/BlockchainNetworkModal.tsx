import React, { useState, useEffect } from 'react';
import { X, Cpu, Globe, Key, ShieldCheck, CheckCircle2, RefreshCw, AlertCircle, Terminal, Layers } from 'lucide-react';
import { blockchainService } from '../services/blockchainService';
import { BlockchainNetworkConfig } from '../types';

interface BlockchainNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
}

export const BlockchainNetworkModal: React.FC<BlockchainNetworkModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [config, setConfig] = useState<BlockchainNetworkConfig>(blockchainService.getConfig());
  const [mode, setMode] = useState<'simulator' | 'metamask' | 'custom_rpc'>(config.mode);
  const [contractAddress, setContractAddress] = useState(config.contractAddress);
  const [rpcUrl, setRpcUrl] = useState(config.rpcUrl || 'http://127.0.0.1:8545');
  const [chainId, setChainId] = useState(config.chainId || 31337);
  const [isSaved, setIsSaved] = useState(false);
  const [simulatorStats, setSimulatorStats] = useState<{ totalRegistered: number; totalRevoked: number }>({
    totalRegistered: 0,
    totalRevoked: 0,
  });

  useEffect(() => {
    if (isOpen) {
      const current = blockchainService.getConfig();
      setConfig(current);
      setMode(current.mode);
      setContractAddress(current.contractAddress);
      setRpcUrl(current.rpcUrl || 'http://127.0.0.1:8545');
      setChainId(current.chainId || 31337);

      // Load simulator on-chain stats
      const records = Object.values(blockchainService.getAllSimulatorRecords());
      setSimulatorStats({
        totalRegistered: records.length,
        totalRevoked: records.filter(r => r.revoked).length,
      });
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: BlockchainNetworkConfig = {
      mode,
      contractAddress: contractAddress.trim() || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      rpcUrl: mode === 'custom_rpc' ? rpcUrl.trim() : 'http://127.0.0.1:8545',
      chainId: mode === 'custom_rpc' ? Number(chainId) : (mode === 'simulator' ? 31337 : 1),
    };
    blockchainService.saveConfig(updated);
    setConfig(updated);
    setIsSaved(true);
    if (onConfigChanged) onConfigChanged();
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleResetSimulator = () => {
    if (window.confirm('Reset local blockchain simulator state to initial seed records?')) {
      blockchainService.resetSimulatorState();
      const records = Object.values(blockchainService.getAllSimulatorRecords());
      setSimulatorStats({
        totalRegistered: records.length,
        totalRevoked: records.filter(r => r.revoked).length,
      });
      if (onConfigChanged) onConfigChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Blockchain Network & Contract Config</h2>
              <p className="text-xs text-slate-500">TrustCredRegistry Solidity Smart Contract Connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Smart Contract Info Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-purple-400" />
                TrustCredRegistry.sol
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-900/80 text-purple-200 text-[10px] font-mono">
                EVM Smart Contract
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Provides immutable registration (<code className="text-purple-300 font-mono">registerCredential</code>), verified querying (<code className="text-purple-300 font-mono">getCredential</code>), and cryptographically auditable revocation (<code className="text-purple-300 font-mono">revokeCredential</code>).
            </p>
          </div>

          {/* Connection Mode Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Blockchain Provider Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'simulator'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">EVM Simulator</span>
                  <input
                    type="radio"
                    name="mode"
                    value="simulator"
                    checked={mode === 'simulator'}
                    onChange={() => setMode('simulator')}
                    className="text-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Zero-configuration local EVM simulation running deterministic blocks & transactions.
                </p>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'metamask'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Browser Wallet</span>
                  <input
                    type="radio"
                    name="mode"
                    value="metamask"
                    checked={mode === 'metamask'}
                    onChange={() => setMode('metamask')}
                    className="text-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Connect MetaMask / window.ethereum for testnets (Sepolia, Hardhat, Polygon).
                </p>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === 'custom_rpc'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Custom RPC</span>
                  <input
                    type="radio"
                    name="mode"
                    value="custom_rpc"
                    checked={mode === 'custom_rpc'}
                    onChange={() => setMode('custom_rpc')}
                    className="text-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Connect to local Hardhat node (<code className="font-mono text-[10px]">http://127.0.0.1:8545</code>) or RPC endpoint.
                </p>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Smart Contract Address (TrustCredRegistry)
              </label>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x5FbDB2315678afecb367f032d93F642f64180aa3"
                className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {mode === 'custom_rpc' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    JSON-RPC Provider URL
                  </label>
                  <input
                    type="text"
                    value={rpcUrl}
                    onChange={(e) => setRpcUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8545"
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chain ID
                  </label>
                  <input
                    type="number"
                    value={chainId}
                    onChange={(e) => setChainId(Number(e.target.value))}
                    placeholder="31337"
                    className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Authorized College Wallets in Smart Contract */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                Approved College Issuers (authorizedIssuers mapping)
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-semibold">
                msg.sender Protection
              </span>
            </div>
            <p className="text-[11px] text-purple-900 leading-relaxed">
              Only transactions sent by the Contract Owner or addresses in <code className="font-mono bg-purple-100 px-1 rounded text-purple-950">authorizedIssuers</code> are allowed to invoke <code className="font-mono bg-purple-100 px-1 rounded text-purple-950">registerCredential()</code>.
            </p>
            <div className="space-y-1.5 pt-1">
              {Object.entries(blockchainService.getAuthorizedIssuers()).map(([addr, data]) => (
                <div key={addr} className="p-2 rounded-lg bg-white border border-purple-100 flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">{data.label}</span>
                    <span className="text-slate-500">{addr}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    Approved ✅
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Live On-Chain State Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Current On-Chain Records in Registry:</span>
              <button
                type="button"
                onClick={handleResetSimulator}
                className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Simulator State
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Anchored</span>
                <span className="font-bold text-slate-900 text-base">{simulatorStats.totalRegistered} Records</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Revoked Records</span>
                <span className="font-bold text-rose-600 text-base">{simulatorStats.totalRevoked} Revoked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                Configuration Saved!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors"
            >
              Apply Network Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

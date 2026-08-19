import { ethers } from 'ethers';
import { BlockchainCredentialRecord, BlockchainNetworkConfig, BlockchainNetworkMode, ConnectedWalletInfo } from '../types';

// Canonical Solidity ABI for TrustCredRegistry
export const TRUST_CRED_REGISTRY_ABI = [
  'constructor()',
  'event CredentialRegistered(string indexed credentialId, string certificateHash, string institution, uint256 issueTimestamp, address indexed issuer)',
  'event CredentialRevoked(string indexed credentialId, uint256 revokedTimestamp, address indexed revoker)',
  'event IssuerAuthorized(address indexed issuer, string collegeName, string collegeCode)',
  'event IssuerDeauthorized(address indexed issuer)',
  'function authorizeIssuer(address issuer) external',
  'function registerApprovedCollege(address issuer, string collegeName, string collegeCode) external',
  'function deauthorizeIssuer(address issuer) external',
  'function registerCredential(string credentialId, string certificateHash, string institution) external',
  'function getCredential(string credentialId) external view returns (string id, string hash, string inst, uint256 timestamp, bool isRevoked, address issuerAddr)',
  'function credentialExists(string credentialId) external view returns (bool)',
  'function revokeCredential(string credentialId) external',
  'function getTotalCredentials() external view returns (uint256)',
  'function getCredentialIdAtIndex(uint256 index) external view returns (string)',
  'function owner() external view returns (address)',
  'function authorizedIssuers(address) external view returns (bool)',
  'function issuerNames(address) external view returns (string)',
  'function issuerCodes(address) external view returns (string)'
];

const CONFIG_STORAGE_KEY = 'trustcred_blockchain_config_v1';
const SIMULATOR_STATE_KEY = 'trustcred_blockchain_state_v1';
const SIMULATOR_BLOCK_KEY = 'trustcred_blockchain_block_v1';
const ACTIVE_WALLET_KEY = 'trustcred_active_wallet_v1';
const AUTHORIZED_ISSUERS_KEY = 'trustcred_authorized_issuers_v1';

// Default development configuration
export const DEFAULT_BLOCKCHAIN_CONFIG: BlockchainNetworkConfig = {
  mode: 'simulator',
  rpcUrl: 'http://127.0.0.1:8545',
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Default Hardhat Contract Address
  chainId: 31337,
};

// Contract Owner and Authorized College Wallets
export const DEFAULT_CONTRACT_OWNER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

export const DEFAULT_AUTHORIZED_COLLEGE_WALLETS: Record<string, { label: string; institution: string; code?: string }> = {
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
    label: 'JNTUH Registrar (Authorized College Wallet)',
    institution: 'JNTUH',
    code: 'JNTUH-HYD-01',
  },
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
    label: 'OU Registrar (Authorized College Wallet)',
    institution: 'Osmania University',
    code: 'OU-HYD-02',
  },
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9': {
    label: 'AUTONOMOUS Principal (Authorized College Wallet)',
    institution: 'AUTONOMOUS',
    code: 'AUTO-COLL-03',
  },
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955': {
    label: 'SBTET Secretary (Authorized College Wallet)',
    institution: 'SBTET',
    code: 'SBTET-TS-04',
  },
};

// Known Standard Wallets for reference and developer testing
export const PRESET_WALLETS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    label: 'JNTUH Registrar (JNTUH)',
    role: 'authorized_college' as const,
    institutionName: 'JNTUH',
    institutionCode: 'JNTUH-HYD-01',
    description: 'Contract Owner & Approved College Issuer on TrustCredRegistry.sol',
    isAuthorized: true,
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    label: 'OU Registrar (Osmania University)',
    role: 'authorized_college' as const,
    institutionName: 'Osmania University',
    institutionCode: 'OU-HYD-02',
    description: 'Approved College Issuer on TrustCredRegistry.sol',
    isAuthorized: true,
  },
  {
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    label: 'AUTONOMOUS Principal (AUTONOMOUS)',
    role: 'authorized_college' as const,
    institutionName: 'AUTONOMOUS',
    institutionCode: 'AUTO-COLL-03',
    description: 'Approved College Issuer on TrustCredRegistry.sol',
    isAuthorized: true,
  },
  {
    address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    label: 'SBTET Secretary (SBTET)',
    role: 'authorized_college' as const,
    institutionName: 'SBTET',
    institutionCode: 'SBTET-TS-04',
    description: 'Approved College Issuer on TrustCredRegistry.sol',
    isAuthorized: true,
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    label: 'Student Account Wallet (Divya Mudavath / STU-2022-9102)',
    role: 'unauthorized_student' as const,
    description: 'Student account wallet — NOT in authorizedIssuers mapping on smart contract',
    isAuthorized: false,
  },
  {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    label: 'Student Account Wallet (Aarav Patel / STU-2022-8419)',
    role: 'unauthorized_student' as const,
    description: 'Student account wallet — NOT in authorizedIssuers mapping on smart contract',
    isAuthorized: false,
  },
];

// Initial Seeded Blockchain State for Demo Credentials (TC-2026-89421, TC-2026-89422, TC-2026-77319, TC-2025-41092)
const DEFAULT_SIMULATOR_RECORDS: Record<string, BlockchainCredentialRecord> = {
  'TC-2026-89421': {
    credentialId: 'TC-2026-89421',
    certificateHash: '610e74734908365b765b07d4f49f3365e917ba181c1384e5ee8b11a5f4017796',
    institution: 'JNTUH',
    issueTimestamp: 1781517600, // 2026-06-15
    revoked: false,
    issuer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    txHash: '0x8f2d9c104e198642398ab716ef204981729481adce174982bbfe3920194812aa',
    blockNumber: 1042,
  },
  'TC-2026-89422': {
    credentialId: 'TC-2026-89422',
    certificateHash: '477b73d0e42bf04161c162c8fe0b1ed8250674c0340c13b7eb6f90b6a5022168',
    institution: 'JNTUH',
    issueTimestamp: 1781793000, // 2026-06-18
    revoked: false,
    issuer: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    txHash: '0x3a9081bcde283948719208341908412891290384aedc09182390184029184021',
    blockNumber: 1045,
  },
  'TC-2026-77319': {
    credentialId: 'TC-2026-77319',
    certificateHash: '7cf395731c0064eb5cc195f41d267a692646077a0e57f02d5ec3b34bd95c02da',
    institution: 'Osmania University',
    issueTimestamp: 1781522400,
    revoked: false,
    issuer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    txHash: '0xc109283019284091820491820491820498102948102948102948102948102948',
    blockNumber: 1043,
  },
  'TC-2025-41092': {
    credentialId: 'TC-2025-41092',
    certificateHash: 'a0d47eded799027021f958d9da4b70f34dc17432cc4ad2e7381325a33e138c19',
    institution: 'AUTONOMOUS',
    issueTimestamp: 1766222100,
    revoked: true,
    issuer: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    txHash: '0x5189204810928401928401928401928401928401928401928401928401928401',
    blockNumber: 988,
  },
};

function getStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export const blockchainService = {
  // Get currently active network configuration
  getConfig(): BlockchainNetworkConfig {
    return getStorage<BlockchainNetworkConfig>(CONFIG_STORAGE_KEY, DEFAULT_BLOCKCHAIN_CONFIG);
  },

  // Update network configuration
  saveConfig(config: BlockchainNetworkConfig): void {
    setStorage(CONFIG_STORAGE_KEY, config);
  },

  // Get active network mode
  getNetworkMode(): BlockchainNetworkMode {
    return this.getConfig().mode;
  },

  // Check if browser wallet (MetaMask) is installed in window
  isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && Boolean((window as any).ethereum);
  },

  // ==========================================
  // WALLET & AUTHORIZATION MANAGEMENT
  // ==========================================

  // Get currently active connected wallet address
  getActiveWalletAddress(): string {
    return getStorage<string>(ACTIVE_WALLET_KEY, DEFAULT_CONTRACT_OWNER);
  },

  // Set active connected wallet address (for testing & live switching)
  setActiveWalletAddress(address: string): void {
    setStorage(ACTIVE_WALLET_KEY, address.trim());
  },

  // Get authorized issuers mapping
  getAuthorizedIssuers(): Record<string, { label: string; institution: string }> {
    return getStorage<Record<string, { label: string; institution: string }>>(
      AUTHORIZED_ISSUERS_KEY,
      DEFAULT_AUTHORIZED_COLLEGE_WALLETS
    );
  },

  // Check if a wallet address is an authorized college issuer on TrustCredRegistry
  async isAuthorizedIssuer(address: string): Promise<boolean> {
    const target = address.trim().toLowerCase();
    const config = this.getConfig();

    // Mode 1: MetaMask
    if (config.mode === 'metamask' && this.isMetaMaskAvailable()) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, provider);
        const owner = await contract.owner();
        if (owner.toLowerCase() === target) return true;
        return await contract.authorizedIssuers(target);
      } catch (e) {
        console.warn('On-chain authorization check failed, falling back to registry cache:', e);
      }
    }

    // Mode 2: Custom RPC
    if (config.mode === 'custom_rpc') {
      try {
        const provider = new ethers.JsonRpcProvider(config.rpcUrl);
        const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, provider);
        const owner = await contract.owner();
        if (owner.toLowerCase() === target) return true;
        return await contract.authorizedIssuers(target);
      } catch (e) {
        console.warn('RPC authorization check failed, falling back to registry cache:', e);
      }
    }

    // Mode 3: Local EVM Simulator / Default Storage
    if (target === DEFAULT_CONTRACT_OWNER.toLowerCase()) return true;
    const authorized = this.getAuthorizedIssuers();
    return Boolean(
      Object.keys(authorized).some((addr) => addr.toLowerCase() === target)
    );
  },

  // Get detailed information for active or specified wallet
  async getWalletInfo(addr?: string): Promise<ConnectedWalletInfo> {
    const address = addr || this.getActiveWalletAddress();
    const isAuthorized = await this.isAuthorizedIssuer(address);
    const presets = PRESET_WALLETS;
    const preset = presets.find((p) => p.address.toLowerCase() === address.toLowerCase());

    return {
      address,
      label: preset?.label || (isAuthorized ? 'Authorized College Wallet' : 'Unauthorized Wallet / Student'),
      isAuthorized,
      role: preset?.role || (isAuthorized ? 'authorized_college' : 'unauthorized_student'),
    };
  },

  // Authorize a college wallet (Owner only function on-chain)
  authorizeIssuer(address: string, label: string, institution: string): void {
    const authorized = this.getAuthorizedIssuers();
    authorized[address] = { label, institution };
    setStorage(AUTHORIZED_ISSUERS_KEY, authorized);
  },

  // Deauthorize a college wallet
  deauthorizeIssuer(address: string): void {
    const authorized = this.getAuthorizedIssuers();
    delete authorized[address];
    setStorage(AUTHORIZED_ISSUERS_KEY, authorized);
  },

  // ==========================================
  // SMART CONTRACT CORE FUNCTIONS
  // ==========================================

  /**
   * Register an academic credential on the blockchain.
   * Sends (credentialId, certificateHash, institution) to TrustCredRegistry.
   * 
   * SOLIDITY REQUIREMENT:
   * The caller (msg.sender) MUST pass onlyAuthorizedIssuer modifier.
   * If unauthorized, reverts with:
   * "Unauthorized college wallet. Credential issuance is restricted to approved colleges."
   */
  async registerCredential(
    credentialId: string,
    certificateHash: string,
    institution: string
  ): Promise<{ txHash: string; blockNumber: number; timestamp: number; issuer: string }> {
    const cleanId = credentialId.trim().toUpperCase();
    const cleanHash = certificateHash.trim().toLowerCase();
    const cleanInst = institution.trim();

    if (!cleanId) throw new Error('Credential ID cannot be empty');
    if (!cleanHash || cleanHash.length !== 64) {
      throw new Error(`Invalid certificate SHA-256 hash length (${cleanHash.length} chars). Must be exactly 64 hex chars.`);
    }
    if (!cleanInst) throw new Error('Institution name cannot be empty');

    const config = this.getConfig();

    // MODE 1: Browser Wallet (MetaMask / EIP-1193)
    if (config.mode === 'metamask') {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask or Web3 wallet extension not detected in browser.');
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, signer);

      try {
        const tx = await contract.registerCredential(cleanId, cleanHash, cleanInst);
        const receipt = await tx.wait();
        const block = await provider.getBlock(receipt.blockNumber);

        return {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
          issuer: await signer.getAddress(),
        };
      } catch (err: any) {
        // Extract exact contract revert reason
        const msg = err?.reason || err?.data?.message || err?.message || '';
        if (msg.includes('Unauthorized college wallet') || msg.includes('not an authorized issuer') || msg.includes('Only registered colleges')) {
          throw new Error('Unauthorized college wallet. Only registered colleges can issue credentials.');
        }
        throw new Error(msg || 'Transaction reverted: Unauthorized college wallet. Only registered colleges can issue credentials.');
      }
    }

    // MODE 2: Custom JSON-RPC Endpoint (Local Hardhat Node / Sepolia Node)
    if (config.mode === 'custom_rpc') {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const signer = await provider.getSigner(0);
      const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, signer);

      try {
        const tx = await contract.registerCredential(cleanId, cleanHash, cleanInst);
        const receipt = await tx.wait();
        const block = await provider.getBlock(receipt.blockNumber);

        return {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
          issuer: await signer.getAddress(),
        };
      } catch (err: any) {
        const msg = err?.reason || err?.data?.message || err?.message || '';
        if (msg.includes('Unauthorized college wallet') || msg.includes('not an authorized issuer') || msg.includes('Only registered colleges')) {
          throw new Error('Unauthorized college wallet. Only registered colleges can issue credentials.');
        }
        throw new Error(msg || 'Transaction reverted: Unauthorized college wallet. Only registered colleges can issue credentials.');
      }
    }

    // MODE 3: Local EVM Development Simulator (Runs exact Solidity logic & state verification)
    const activeWallet = this.getActiveWalletAddress();

    // 🔒 SMART CONTRACT AUTHORIZATION BARRIER (msg.sender check in Solidity onlyAuthorizedIssuer)
    const isAuthorized = await this.isAuthorizedIssuer(activeWallet);
    if (!isAuthorized) {
      throw new Error('Unauthorized college wallet. Only registered colleges can issue credentials.');
    }

    const records = getStorage<Record<string, BlockchainCredentialRecord>>(
      SIMULATOR_STATE_KEY,
      DEFAULT_SIMULATOR_RECORDS
    );

    // Solidity check: prevent duplicate registration
    if (records[cleanId]) {
      throw new Error(`TrustCredRegistry: Credential ID '${cleanId}' is already registered on blockchain.`);
    }

    const currentBlock = getStorage<number>(SIMULATOR_BLOCK_KEY, 1050) + 1;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const issuerAddress = activeWallet;

    // Generate deterministic keccak256 transaction hash matching EVM standard
    const txHashBytes = ethers.toUtf8Bytes(`TX_REGISTER:${cleanId}:${cleanHash}:${currentTimestamp}:${currentBlock}:${issuerAddress}`);
    const txHash = ethers.keccak256(txHashBytes);

    const newRecord: BlockchainCredentialRecord = {
      credentialId: cleanId,
      certificateHash: cleanHash,
      institution: cleanInst,
      issueTimestamp: currentTimestamp,
      revoked: false,
      issuer: issuerAddress,
      txHash,
      blockNumber: currentBlock,
    };

    records[cleanId] = newRecord;
    setStorage(SIMULATOR_STATE_KEY, records);
    setStorage(SIMULATOR_BLOCK_KEY, currentBlock);

    return {
      txHash,
      blockNumber: currentBlock,
      timestamp: currentTimestamp,
      issuer: issuerAddress,
    };
  },

  /**
   * Look up a credential record from the smart contract by Credential ID.
   * Calls getCredential(credentialId) on TrustCredRegistry.
   */
  async getCredential(credentialId: string): Promise<BlockchainCredentialRecord | null> {
    const cleanId = credentialId.trim().toUpperCase();
    if (!cleanId) return null;

    const config = this.getConfig();

    // MODE 1 & 2: Real EVM Node (MetaMask / Custom RPC)
    if (config.mode === 'metamask' || config.mode === 'custom_rpc') {
      try {
        let provider: ethers.Provider;
        if (config.mode === 'metamask' && this.isMetaMaskAvailable()) {
          provider = new ethers.BrowserProvider((window as any).ethereum);
        } else {
          provider = new ethers.JsonRpcProvider(config.rpcUrl);
        }

        const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, provider);
        const exists = await contract.credentialExists(cleanId);
        if (!exists) return null;

        const result = await contract.getCredential(cleanId);
        // returns: [id, hash, inst, timestamp, isRevoked, issuerAddr]
        return {
          credentialId: result[0],
          certificateHash: result[1],
          institution: result[2],
          issueTimestamp: Number(result[3]),
          revoked: Boolean(result[4]),
          issuer: result[5],
        };
      } catch (err: any) {
        console.warn('EVM lookup error:', err);
        // Fall back to simulator storage if remote RPC lookup fails
      }
    }

    // MODE 3: Local EVM Development Simulator
    try {
      const res = await fetch(`/api/blockchain/record/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const record: BlockchainCredentialRecord = await res.json();
        if (record && record.credentialId) {
          return record;
        }
      }
    } catch {
      // Fall through to local storage
    }

    const records = getStorage<Record<string, BlockchainCredentialRecord>>(
      SIMULATOR_STATE_KEY,
      DEFAULT_SIMULATOR_RECORDS
    );

    return records[cleanId] || null;
  },

  /**
   * Revoke an academic credential on the blockchain.
   * Calls revokeCredential(credentialId) on TrustCredRegistry.
   * Sets revoked = true without deleting the record.
   */
  async revokeCredential(credentialId: string): Promise<{ txHash: string; blockNumber: number; timestamp: number }> {
    const cleanId = credentialId.trim().toUpperCase();
    if (!cleanId) throw new Error('Credential ID cannot be empty');

    const config = this.getConfig();
    const activeWallet = this.getActiveWalletAddress();

    // 🔒 Enforce authorization for revocation as well
    const isAuthorized = await this.isAuthorizedIssuer(activeWallet);
    if (!isAuthorized) {
      throw new Error('Unauthorized college wallet. Credential revocation is restricted to approved colleges.');
    }

    // MODE 1: Browser Wallet
    if (config.mode === 'metamask') {
      if (!this.isMetaMaskAvailable()) {
        throw new Error('MetaMask or Web3 wallet extension not detected in browser.');
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, signer);

      try {
        const tx = await contract.revokeCredential(cleanId);
        const receipt = await tx.wait();
        const block = await provider.getBlock(receipt.blockNumber);

        // Also sync server store
        try {
          await fetch('/api/credentials/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credentialId: cleanId }),
          });
        } catch {
          // ignore
        }

        return {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
        };
      } catch (err: any) {
        const msg = err?.reason || err?.data?.message || err?.message || '';
        if (msg.includes('Unauthorized college wallet') || msg.includes('not an authorized issuer')) {
          throw new Error('Unauthorized college wallet. Credential revocation is restricted to approved colleges.');
        }
        throw new Error(msg || 'Transaction reverted');
      }
    }

    // MODE 2: Custom JSON-RPC
    if (config.mode === 'custom_rpc') {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);
      const signer = await provider.getSigner(0);
      const contract = new ethers.Contract(config.contractAddress, TRUST_CRED_REGISTRY_ABI, signer);

      try {
        const tx = await contract.revokeCredential(cleanId);
        const receipt = await tx.wait();
        const block = await provider.getBlock(receipt.blockNumber);

        // Also sync server store
        try {
          await fetch('/api/credentials/revoke', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credentialId: cleanId }),
          });
        } catch {
          // ignore
        }

        return {
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          timestamp: block?.timestamp || Math.floor(Date.now() / 1000),
        };
      } catch (err: any) {
        const msg = err?.reason || err?.data?.message || err?.message || '';
        if (msg.includes('Unauthorized college wallet') || msg.includes('not an authorized issuer')) {
          throw new Error('Unauthorized college wallet. Credential revocation is restricted to approved colleges.');
        }
        throw new Error(msg || 'Transaction reverted');
      }
    }

    // MODE 3: Local EVM Development Simulator
    // Try server revocation API first
    try {
      const res = await fetch('/api/credentials/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId: cleanId }),
      });
      if (res.ok) {
        const serverData = await res.json();
        // Also update local storage for offline consistency
        const records = getStorage<Record<string, BlockchainCredentialRecord>>(
          SIMULATOR_STATE_KEY,
          DEFAULT_SIMULATOR_RECORDS
        );
        records[cleanId] = serverData.blockchainRecord;
        setStorage(SIMULATOR_STATE_KEY, records);
        if (serverData.blockNumber) {
          setStorage(SIMULATOR_BLOCK_KEY, serverData.blockNumber);
        }
        return {
          txHash: serverData.txHash,
          blockNumber: serverData.blockNumber || 1051,
          timestamp: Math.floor(Date.now() / 1000),
        };
      }
    } catch {
      // fallback to local computation
    }

    const records = getStorage<Record<string, BlockchainCredentialRecord>>(
      SIMULATOR_STATE_KEY,
      DEFAULT_SIMULATOR_RECORDS
    );

    const record = records[cleanId];
    if (!record) {
      throw new Error(`TrustCredRegistry: Credential ID '${cleanId}' not found on blockchain.`);
    }
    if (record.revoked) {
      throw new Error(`TrustCredRegistry: Credential ID '${cleanId}' is already marked as REVOKED on-chain.`);
    }

    const currentBlock = getStorage<number>(SIMULATOR_BLOCK_KEY, 1050) + 1;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const txHashBytes = ethers.toUtf8Bytes(`TX_REVOKE:${cleanId}:${currentTimestamp}:${currentBlock}`);
    const txHash = ethers.keccak256(txHashBytes);

    // Update state to revoked = true (Record is NEVER deleted)
    record.revoked = true;
    record.txHash = txHash;
    record.blockNumber = currentBlock;

    records[cleanId] = record;
    setStorage(SIMULATOR_STATE_KEY, records);
    setStorage(SIMULATOR_BLOCK_KEY, currentBlock);

    return {
      txHash,
      blockNumber: currentBlock,
      timestamp: currentTimestamp,
    };
  },

  // Reset simulator state back to defaults
  resetSimulatorState(): void {
    setStorage(SIMULATOR_STATE_KEY, DEFAULT_SIMULATOR_RECORDS);
    setStorage(SIMULATOR_BLOCK_KEY, 1050);
    setStorage(ACTIVE_WALLET_KEY, DEFAULT_CONTRACT_OWNER);
    setStorage(AUTHORIZED_ISSUERS_KEY, DEFAULT_AUTHORIZED_COLLEGE_WALLETS);
  },

  // Get all registered records from simulator (for developer inspection)
  getAllSimulatorRecords(): Record<string, BlockchainCredentialRecord> {
    return getStorage<Record<string, BlockchainCredentialRecord>>(
      SIMULATOR_STATE_KEY,
      DEFAULT_SIMULATOR_RECORDS
    );
  }
};

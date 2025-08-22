// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract FinalityVerifierV2 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    using ECDSA for bytes32;

    struct FinalityProof {
        bytes32 txHash;
        uint256 timestamp;
        uint8 status;
        uint256 slaTarget;
        uint256 chainId;
        uint256 confirmations;
        bytes32[] merkleProof;
        bytes signature;
    }

    struct Oracle {
        address oracleAddress;
        bool isActive;
        uint256 stake;
        uint256 reputation;
    }

    mapping(address => Oracle) public oracles;
    mapping(bytes32 => FinalityProof) public finalityProofs;
    mapping(bytes32 => bool) public verifiedTransactions;
    
    address[] public activeOracles;
    uint256 public requiredSignatures;
    uint256 public maxOracles;
    uint256 public minStake;
    uint256 public slashingAmount;
    
    event ProofSubmitted(bytes32 indexed txHash, address indexed oracle, uint256 timestamp);
    event ProofVerified(bytes32 indexed txHash, bool isValid);
    event OracleAdded(address indexed oracle, uint256 stake);
    event OracleRemoved(address indexed oracle, uint256 slashedAmount);
    event StakeSlashed(address indexed oracle, uint256 amount, string reason);
    
    error InvalidSignature();
    error InsufficientStake();
    error OracleNotActive();
    error ProofAlreadyExists();
    error InsufficientSignatures();
    error InvalidMerkleProof();

    function initialize(
        address initialOwner,
        uint256 _requiredSignatures,
        uint256 _maxOracles,
        uint256 _minStake,
        uint256 _slashingAmount
    ) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        
        requiredSignatures = _requiredSignatures;
        maxOracles = _maxOracles;
        minStake = _minStake;
        slashingAmount = _slashingAmount;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function addOracle(address _oracle, uint256 _stake) external onlyOwner {
        if (_stake < minStake) revert InsufficientStake();
        if (activeOracles.length >= maxOracles) revert("Max oracles reached");
        
        oracles[_oracle] = Oracle({
            oracleAddress: _oracle,
            isActive: true,
            stake: _stake,
            reputation: 100
        });
        
        activeOracles.push(_oracle);
        emit OracleAdded(_oracle, _stake);
    }
    
    function removeOracle(address _oracle) external onlyOwner {
        if (!oracles[_oracle].isActive) revert OracleNotActive();
        
        oracles[_oracle].isActive = false;
        
        for (uint256 i = 0; i < activeOracles.length; i++) {
            if (activeOracles[i] == _oracle) {
                activeOracles[i] = activeOracles[activeOracles.length - 1];
                activeOracles.pop();
                break;
            }
        }
        
        emit OracleRemoved(_oracle, oracles[_oracle].stake);
    }
    
    function submitFinalityProof(
        bytes32 _txHash,
        uint256 _timestamp,
        uint8 _status,
        uint256 _slaTarget,
        uint256 _chainId,
        uint256 _confirmations,
        bytes32[] calldata _merkleProof,
        bytes calldata _signature
    ) external {
        if (!oracles[msg.sender].isActive) revert OracleNotActive();
        if (finalityProofs[_txHash].txHash != bytes32(0)) revert ProofAlreadyExists();
        
        bytes32 messageHash = keccak256(abi.encodePacked(
            _txHash, _timestamp, _status, _slaTarget, _chainId, _confirmations
        ));
        
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, _signature);
        if (signer != msg.sender) revert InvalidSignature();
        
        finalityProofs[_txHash] = FinalityProof({
            txHash: _txHash,
            timestamp: _timestamp,
            status: _status,
            slaTarget: _slaTarget,
            chainId: _chainId,
            confirmations: _confirmations,
            merkleProof: _merkleProof,
            signature: _signature
        });
        
        emit ProofSubmitted(_txHash, msg.sender, _timestamp);
    }
    
    function verifyFinality(bytes32 _txHash) external view returns (bool) {
        FinalityProof memory proof = finalityProofs[_txHash];
        if (proof.txHash == bytes32(0)) return false;
        
        return proof.status == 1 && proof.confirmations >= proof.slaTarget;
    }
    
    function getFinalityProof(bytes32 _txHash) external view returns (FinalityProof memory) {
        return finalityProofs[_txHash];
    }
    
    function getActiveOracles() external view returns (address[] memory) {
        return activeOracles;
    }
    
    function getOracleInfo(address _oracle) external view returns (Oracle memory) {
        return oracles[_oracle];
    }
    
    function version() public pure returns (string memory) {
        return "v2.0.0";
    }
}

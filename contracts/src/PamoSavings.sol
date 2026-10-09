// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable, Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title PamoSavings
/// @notice Savings pots on Arc. Each pot belongs to one owner and holds shares of one
///         ERC-4626 USDC lending vault, chosen by the pot's tier when it opens.
/// @dev Non-custodial: only a pot's owner can withdraw from it, and withdrawals always pay
///      the owner. The admin can set which vault a tier uses for new pots and pause new
///      deposits. The admin cannot withdraw, move or freeze user funds, and withdrawals
///      work while paused.
contract PamoSavings is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    enum Kind {
        Anytime,
        Goal
    }

    enum Tier {
        Calm,
        Steady,
        Bold
    }

    struct Pot {
        address owner;
        Kind kind;
        Tier tier;
        bool unlocked; // Goal only: set once the goal first unlocks, never cleared
        uint64 unlockAt; // Goal only, unix seconds
        address vault; // fixed when the pot opens
        uint256 shares; // vault shares held for this pot, in the vault's own decimals
        uint256 principal; // USDC in minus USDC out (6 dp), for "earned"
        uint256 target; // Goal only, USDC (6 dp)
    }

    /// @notice One pot with its live value, for reading a whole dashboard in one call.
    struct PotView {
        uint256 id;
        Pot pot;
        uint256 value; // USDC (6 dp) the pot's shares are worth now
        bool unlocked; // whether a withdrawal is allowed now
    }

    /// @notice USDC through its ERC-20 interface (6 decimals). Same address on Arc mainnet and testnet.
    IERC20 public constant USDC = IERC20(0x3600000000000000000000000000000000000000);

    /// @notice Longest pot name accepted, in bytes. Names are public onchain.
    uint256 public constant MAX_NAME_LENGTH = 64;

    /// @notice The vault new pots of each tier are opened in.
    mapping(Tier => address) public vaultFor;
    mapping(uint256 => Pot) public pots;
    mapping(address => uint256[]) public potsOf;
    uint256 public nextId = 1;

    event PotOpened(
        uint256 indexed id,
        address indexed owner,
        Kind kind,
        Tier tier,
        address vault,
        uint256 target,
        uint64 unlockAt,
        string name
    );
    event Deposited(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares);
    event Withdrawn(uint256 indexed id, address indexed owner, uint256 assets, uint256 shares);
    event TierVaultSet(Tier indexed tier, address vault);

    error NotPotOwner();
    error ZeroAmount();
    error NameTooLong();
    error TierNotSet();
    error InvalidGoal();
    error GoalLocked();
    error AmountExceedsValue();
    error NothingToWithdraw();
    error InvalidVault();

    constructor(address initialOwner, address calmVault, address steadyVault, address boldVault) Ownable(initialOwner) {
        _setTierVault(Tier.Calm, calmVault);
        _setTierVault(Tier.Steady, steadyVault);
        _setTierVault(Tier.Bold, boldVault);
    }

    // ───────────────────────────── user ─────────────────────────────

    /// @notice Open a pot and, if `assets` is above zero, make its first deposit in the same call.
    /// @param target Goal only: USDC (6 dp) at which the goal unlocks.
    /// @param unlockAt Goal only: unix time at which the goal unlocks.
    /// @param name Shown in the app. Lives only in the PotOpened event.
    /// @param assets USDC (6 dp) to deposit now. Needs a USDC allowance for this contract.
    function openPot(Kind kind, Tier tier, uint256 target, uint64 unlockAt, string calldata name, uint256 assets)
        external
        nonReentrant
        whenNotPaused
        returns (uint256 id)
    {
        if (bytes(name).length > MAX_NAME_LENGTH) revert NameTooLong();
        address vault = vaultFor[tier];
        if (vault == address(0)) revert TierNotSet();

        if (kind == Kind.Goal) {
            if (target == 0 || unlockAt <= block.timestamp) revert InvalidGoal();
        } else {
            target = 0;
            unlockAt = 0;
        }

        id = nextId++;
        pots[id] = Pot({
            owner: msg.sender,
            kind: kind,
            tier: tier,
            unlocked: false,
            unlockAt: unlockAt,
            vault: vault,
            shares: 0,
            principal: 0,
            target: target
        });
        potsOf[msg.sender].push(id);
        emit PotOpened(id, msg.sender, kind, tier, vault, target, unlockAt, name);

        if (assets > 0) _deposit(id, pots[id], assets);
    }

    /// @notice Add USDC to a pot you own. Needs a USDC allowance for this contract.
    function deposit(uint256 id, uint256 assets) external nonReentrant whenNotPaused {
        Pot storage pot = pots[id];
        if (pot.owner != msg.sender) revert NotPotOwner();
        if (assets == 0) revert ZeroAmount();
        _deposit(id, pot, assets);
    }

    /// @notice Withdraw `assets` USDC from a pot you own. Works while paused.
    /// @dev Redeems the shares that cover `assets`, rounded up, so the owner can receive
    ///      a few micro-USDC more than asked. Use withdrawAll to empty a pot.
    function withdraw(uint256 id, uint256 assets) external nonReentrant {
        Pot storage pot = pots[id];
        if (pot.owner != msg.sender) revert NotPotOwner();
        if (assets == 0) revert ZeroAmount();
        _requireUnlocked(pot);

        uint256 shares = IERC4626(pot.vault).previewWithdraw(assets);
        if (shares == 0) revert ZeroAmount();
        if (shares > pot.shares) revert AmountExceedsValue();
        _redeem(id, pot, shares);
    }

    /// @notice Withdraw everything from a pot you own. Works while paused.
    function withdrawAll(uint256 id) external nonReentrant {
        Pot storage pot = pots[id];
        if (pot.owner != msg.sender) revert NotPotOwner();
        if (pot.shares == 0) revert NothingToWithdraw();
        _requireUnlocked(pot);
        _redeem(id, pot, pot.shares);
    }

    // ───────────────────────────── views ─────────────────────────────

    /// @notice One pot as a struct.
    function getPot(uint256 id) external view returns (Pot memory) {
        return pots[id];
    }

    /// @notice USDC (6 dp) a pot's shares are worth right now.
    function potValue(uint256 id) public view returns (uint256) {
        return _value(pots[id]);
    }

    /// @notice Whether a withdrawal from this pot is allowed right now.
    function isUnlocked(uint256 id) public view returns (bool) {
        return _isUnlocked(pots[id]);
    }

    /// @notice Every pot of one owner, with live value and lock state.
    function getPots(address owner_) external view returns (PotView[] memory views) {
        uint256[] storage ids = potsOf[owner_];
        views = new PotView[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            Pot storage pot = pots[ids[i]];
            views[i] = PotView({id: ids[i], pot: pot, value: _value(pot), unlocked: _isUnlocked(pot)});
        }
    }

    function potCount(address owner_) external view returns (uint256) {
        return potsOf[owner_].length;
    }

    // ───────────────────────────── admin ─────────────────────────────

    /// @notice Set the vault a tier uses for new pots. Existing pots keep their vault.
    function setTierVault(Tier tier, address vault) external onlyOwner {
        _setTierVault(tier, vault);
    }

    /// @notice Stop new pots and new deposits. Withdrawals keep working.
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ───────────────────────────── internal ─────────────────────────────

    function _deposit(uint256 id, Pot storage pot, uint256 assets) internal {
        IERC4626 vault = IERC4626(pot.vault);
        USDC.safeTransferFrom(msg.sender, address(this), assets);
        USDC.forceApprove(address(vault), assets);
        uint256 shares = vault.deposit(assets, address(this));
        if (shares == 0) revert ZeroAmount();

        pot.shares += shares;
        pot.principal += assets;
        // A goal that reaches its target stays unlocked from here on.
        if (pot.kind == Kind.Goal && !pot.unlocked && _targetReached(pot)) pot.unlocked = true;

        emit Deposited(id, msg.sender, assets, shares);
    }

    function _redeem(uint256 id, Pot storage pot, uint256 shares) internal {
        uint256 principalOut = pot.principal * shares / pot.shares; // pro rata
        pot.shares -= shares;
        pot.principal -= principalOut;

        uint256 assets = IERC4626(pot.vault).redeem(shares, pot.owner, address(this));
        emit Withdrawn(id, pot.owner, assets, shares);
    }

    /// @dev Reverts for a locked goal. Records the unlock so a partial withdrawal
    ///      that takes the pot back under its target does not lock it again.
    function _requireUnlocked(Pot storage pot) internal {
        if (pot.kind != Kind.Goal || pot.unlocked) return;
        if (!_isUnlocked(pot)) revert GoalLocked();
        pot.unlocked = true;
    }

    function _isUnlocked(Pot storage pot) internal view returns (bool) {
        if (pot.kind != Kind.Goal || pot.unlocked) return true;
        return block.timestamp >= pot.unlockAt || _targetReached(pot);
    }

    /// @dev Money put in counts as well as current value: depositing exactly the target
    ///      is worth one micro-USDC less than the target after the vault's rounding.
    function _targetReached(Pot storage pot) internal view returns (bool) {
        return pot.principal >= pot.target || _value(pot) >= pot.target;
    }

    function _value(Pot storage pot) internal view returns (uint256) {
        if (pot.shares == 0) return 0;
        return IERC4626(pot.vault).previewRedeem(pot.shares);
    }

    function _setTierVault(Tier tier, address vault) internal {
        if (vault == address(0) || vault.code.length == 0) revert InvalidVault();
        if (IERC4626(vault).asset() != address(USDC)) revert InvalidVault();
        vaultFor[tier] = vault;
        emit TierVaultSet(tier, vault);
    }
}

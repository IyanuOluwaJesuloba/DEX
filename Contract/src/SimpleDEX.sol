// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title SimpleDEX
 * @dev A simple decentralized exchange for token swaps and liquidity provision
 */
contract SimpleDEX {
    // Token pair structure
    struct TokenPair {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalLiquidity;
    }

    // Mapping of token pairs
    mapping(bytes32 => TokenPair) public pairs;
    mapping(bytes32 => mapping(address => uint256)) public liquidityBalance;

    // Events
    event PairCreated(address indexed token0, address indexed token1, bytes32 pairId);
    event LiquidityAdded(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event LiquidityRemoved(
        address indexed provider,
        address indexed token0,
        address indexed token1,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event Swap(
        address indexed trader,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /**
     * @dev Create a new token pair
     */
    function createPair(address token0, address token1) external returns (bytes32) {
        require(token0 != address(0) && token1 != address(0), "Invalid token address");
        require(token0 != token1, "Identical tokens");

        bytes32 pairId = keccak256(abi.encodePacked(token0, token1));
        require(pairs[pairId].token0 == address(0), "Pair already exists");

        pairs[pairId] = TokenPair({
            token0: token0,
            token1: token1,
            reserve0: 0,
            reserve1: 0,
            totalLiquidity: 0
        });

        emit PairCreated(token0, token1, pairId);
        return pairId;
    }

    /**
     * @dev Get pair ID for two tokens
     */
    function getPairId(address token0, address token1) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(token0, token1));
    }

    /**
     * @dev Add liquidity to a pair
     */
    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external returns (uint256 liquidity) {
        bytes32 pairId = getPairId(token0, token1);
        TokenPair storage pair = pairs[pairId];

        require(pair.token0 != address(0), "Pair does not exist");
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");

        // Transfer tokens from user
        require(IERC20(token0).transferFrom(msg.sender, address(this), amount0), "Transfer failed");
        require(IERC20(token1).transferFrom(msg.sender, address(this), amount1), "Transfer failed");

        // Calculate liquidity
        if (pair.totalLiquidity == 0) {
            liquidity = sqrt(amount0 * amount1);
        } else {
            uint256 liquidity0 = (amount0 * pair.totalLiquidity) / pair.reserve0;
            uint256 liquidity1 = (amount1 * pair.totalLiquidity) / pair.reserve1;
            liquidity = liquidity0 < liquidity1 ? liquidity0 : liquidity1;
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        // Update reserves and liquidity
        pair.reserve0 += amount0;
        pair.reserve1 += amount1;
        pair.totalLiquidity += liquidity;
        liquidityBalance[pairId][msg.sender] += liquidity;

        emit LiquidityAdded(msg.sender, token0, token1, amount0, amount1, liquidity);
        return liquidity;
    }

    /**
     * @dev Remove liquidity from a pair
     */
    function removeLiquidity(
        address token0,
        address token1,
        uint256 liquidity
    ) external returns (uint256 amount0, uint256 amount1) {
        bytes32 pairId = getPairId(token0, token1);
        TokenPair storage pair = pairs[pairId];

        require(pair.token0 != address(0), "Pair does not exist");
        require(liquidityBalance[pairId][msg.sender] >= liquidity, "Insufficient liquidity");

        // Calculate amounts
        amount0 = (liquidity * pair.reserve0) / pair.totalLiquidity;
        amount1 = (liquidity * pair.reserve1) / pair.totalLiquidity;

        require(amount0 > 0 && amount1 > 0, "Insufficient output");

        // Update reserves and liquidity
        pair.reserve0 -= amount0;
        pair.reserve1 -= amount1;
        pair.totalLiquidity -= liquidity;
        liquidityBalance[pairId][msg.sender] -= liquidity;

        // Transfer tokens to user
        require(IERC20(token0).transfer(msg.sender, amount0), "Transfer failed");
        require(IERC20(token1).transfer(msg.sender, amount1), "Transfer failed");

        emit LiquidityRemoved(msg.sender, token0, token1, amount0, amount1, liquidity);
        return (amount0, amount1);
    }

    /**
     * @dev Swap tokens using constant product formula (x * y = k)
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        bytes32 pairId = getPairId(tokenIn, tokenOut);
        TokenPair storage pair = pairs[pairId];

        require(pair.token0 != address(0), "Pair does not exist");
        require(amountIn > 0, "Invalid amount");

        // Determine which token is which
        bool isToken0In = tokenIn == pair.token0;
        require(isToken0In || tokenIn == pair.token1, "Invalid token");

        uint256 reserveIn = isToken0In ? pair.reserve0 : pair.reserve1;
        uint256 reserveOut = isToken0In ? pair.reserve1 : pair.reserve0;

        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        // Calculate output with 0.3% fee
        uint256 amountInWithFee = amountIn * 997;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);

        require(amountOut > 0, "Insufficient output");

        // Transfer tokens
        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Transfer in failed");
        require(IERC20(tokenOut).transfer(msg.sender, amountOut), "Transfer out failed");

        // Update reserves
        if (isToken0In) {
            pair.reserve0 += amountIn;
            pair.reserve1 -= amountOut;
        } else {
            pair.reserve1 += amountIn;
            pair.reserve0 -= amountOut;
        }

        emit Swap(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
        return amountOut;
    }

    /**
     * @dev Get reserves for a pair
     */
    function getReserves(address token0, address token1)
        external
        view
        returns (uint256 reserve0, uint256 reserve1)
    {
        bytes32 pairId = getPairId(token0, token1);
        TokenPair storage pair = pairs[pairId];
        return (pair.reserve0, pair.reserve1);
    }

    /**
     * @dev Get liquidity balance for a user
     */
    function getLiquidityBalance(address token0, address token1, address user)
        external
        view
        returns (uint256)
    {
        bytes32 pairId = getPairId(token0, token1);
        return liquidityBalance[pairId][user];
    }

    /**
     * @dev Calculate square root (for initial liquidity calculation)
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}

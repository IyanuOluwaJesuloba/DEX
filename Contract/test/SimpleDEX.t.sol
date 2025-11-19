// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {SimpleDEX} from "../src/SimpleDEX.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract SimpleDEXTest is Test {
    SimpleDEX public dex;
    MockERC20 public tokenA;
    MockERC20 public tokenB;
    address public user1 = address(0x1);
    address public user2 = address(0x2);

    function setUp() public {
        dex = new SimpleDEX();
        tokenA = new MockERC20("Token A", "TKNA", 18);
        tokenB = new MockERC20("Token B", "TKNB", 18);

        // Mint tokens to users
        tokenA.mint(user1, 1000 ether);
        tokenB.mint(user1, 1000 ether);
        tokenA.mint(user2, 1000 ether);
        tokenB.mint(user2, 1000 ether);
    }

    function testCreatePair() public {
        bytes32 pairId = dex.createPair(address(tokenA), address(tokenB));
        assertNotEq(pairId, bytes32(0));

        (address token0, address token1, uint256 reserve0, uint256 reserve1, uint256 totalLiquidity) =
            dex.pairs(pairId);
        assertEq(token0, address(tokenA));
        assertEq(token1, address(tokenB));
        assertEq(reserve0, 0);
        assertEq(reserve1, 0);
        assertEq(totalLiquidity, 0);
    }

    function testAddLiquidity() public {
        dex.createPair(address(tokenA), address(tokenB));

        vm.startPrank(user1);
        tokenA.approve(address(dex), 100 ether);
        tokenB.approve(address(dex), 100 ether);

        uint256 liquidity = dex.addLiquidity(address(tokenA), address(tokenB), 100 ether, 100 ether);
        assertGt(liquidity, 0);

        (uint256 reserve0, uint256 reserve1) = dex.getReserves(address(tokenA), address(tokenB));
        assertEq(reserve0, 100 ether);
        assertEq(reserve1, 100 ether);
        vm.stopPrank();
    }

    function testRemoveLiquidity() public {
        dex.createPair(address(tokenA), address(tokenB));

        vm.startPrank(user1);
        tokenA.approve(address(dex), 100 ether);
        tokenB.approve(address(dex), 100 ether);

        uint256 liquidity = dex.addLiquidity(address(tokenA), address(tokenB), 100 ether, 100 ether);

        (uint256 amount0, uint256 amount1) =
            dex.removeLiquidity(address(tokenA), address(tokenB), liquidity);
        assertEq(amount0, 100 ether);
        assertEq(amount1, 100 ether);

        (uint256 reserve0, uint256 reserve1) = dex.getReserves(address(tokenA), address(tokenB));
        assertEq(reserve0, 0);
        assertEq(reserve1, 0);
        vm.stopPrank();
    }

    function testSwap() public {
        dex.createPair(address(tokenA), address(tokenB));

        // Add liquidity
        vm.startPrank(user1);
        tokenA.approve(address(dex), 1000 ether);
        tokenB.approve(address(dex), 1000 ether);
        dex.addLiquidity(address(tokenA), address(tokenB), 1000 ether, 1000 ether);
        vm.stopPrank();

        // Perform swap
        vm.startPrank(user2);
        tokenA.approve(address(dex), 100 ether);
        uint256 amountOut = dex.swap(address(tokenA), address(tokenB), 100 ether);
        assertGt(amountOut, 0);
        assertLt(amountOut, 100 ether); // Should be less due to fee
        vm.stopPrank();
    }

    function testSwapWithFee() public {
        dex.createPair(address(tokenA), address(tokenB));

        // Add liquidity
        vm.startPrank(user1);
        tokenA.approve(address(dex), 1000 ether);
        tokenB.approve(address(dex), 1000 ether);
        dex.addLiquidity(address(tokenA), address(tokenB), 1000 ether, 1000 ether);
        vm.stopPrank();

        // Perform swap
        vm.startPrank(user2);
        tokenA.approve(address(dex), 100 ether);
        uint256 amountOut = dex.swap(address(tokenA), address(tokenB), 100 ether);

        // With 0.3% fee, output should be approximately 99.7 ether
        // Exact calculation: (100 * 997 * 1000) / (1000 * 1000 + 100 * 997)
        uint256 expectedOut = (100 ether * 997 * 1000) / (1000 ether * 1000 + 100 ether * 997);
        assertApproxEqAbs(amountOut, expectedOut, 1);
        vm.stopPrank();
    }
}

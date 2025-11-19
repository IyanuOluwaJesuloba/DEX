// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {SimpleDEX} from "../src/SimpleDEX.sol";

contract SimpleDEXScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        SimpleDEX dex = new SimpleDEX();
        
        vm.stopBroadcast();
        
        // Log the deployed address
        console.log("SimpleDEX deployed at:", address(dex));
    }
}

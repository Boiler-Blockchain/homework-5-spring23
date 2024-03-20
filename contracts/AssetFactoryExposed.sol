// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Marketplace.sol";

//necessary because ownerOf is an internal function
contract AssetFactoryExposed is AssetFactory {
    function _ownerOf(uint256 a) external view returns (address) {
        return ownerOf(a);
    }
}
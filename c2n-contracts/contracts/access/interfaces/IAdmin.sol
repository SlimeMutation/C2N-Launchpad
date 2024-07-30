//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.7;

interface IAdmin {
    function isAdmin(address user) external view returns (bool);
}

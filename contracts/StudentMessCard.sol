// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract StudentMessCard {
    // Mapping to store USN as key and hash value as value
    mapping(string => bytes32) public messCardHashes;

    // Function to add a student's USN and mess card hash to the mapping
    function addMessCard(string memory usn, bytes32 hash) public {
        messCardHashes[usn] = hash;
    }

    // Function to retrieve the mess card hash associated with a USN
    function getMessCardHash(string memory usn) public view returns (bytes32) {
        return messCardHashes[usn];
    }
}

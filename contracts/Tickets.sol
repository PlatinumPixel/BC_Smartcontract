// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Tickets {
    address public owner;

    struct Ticket {
        uint256 id;
        address owner;
        uint256 price;
        bool isSold;
    }

    Ticket[] public tickets; // Dynamic array
    uint256 private _nextId = 0; // Track next ticket ID

    constructor() {
        owner = msg.sender;
    }

    // Mint a new ticket (only owner)
    function mintTicket(uint256 price) external {
        require(msg.sender == owner, "Only owner can mint");
        tickets.push(Ticket(_nextId, address(0), price, false));
        _nextId++;
    }

    // Buy a ticket
    function buyTicket(uint256 ticketId) external payable {
        require(ticketId < tickets.length, "Invalid ticket ID");
        require(!tickets[ticketId].isSold, "Ticket already sold");
        require(msg.value >= tickets[ticketId].price, "Insufficient payment");

        tickets[ticketId].owner = msg.sender;
        tickets[ticketId].isSold = true;
    }

    // Sell a ticket (owner can resell)
    function sellTicket(uint256 ticketId, uint256 newPrice) external {
        require(msg.sender == tickets[ticketId].owner, "Not the owner");
        require(tickets[ticketId].isSold, "Ticket not sold yet");

        tickets[ticketId].owner = address(0);
        tickets[ticketId].price = newPrice;
        tickets[ticketId].isSold = false;
    }
}
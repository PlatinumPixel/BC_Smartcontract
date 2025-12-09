// SPDX-License-Identifier: MIT
// Tells the Solidity compiler to compile only from v0.8.13 to v0.9.0
pragma solidity ^0.8.13;

uint256 constant TOTAL_TICKETS = 10;


contract Tickets {
    address public owner = msg.sender; 

    struct Ticket {
        uint256 id;
        address owner;
        uint256 price;
        bool isSold;
    }

    Ticket[TOTAL_TICKETS] public tickets;

    constructor() {
        for (uint256 i = 0; i < TOTAL_TICKETS; i++) {
            tickets[i] = Ticket(i, address(0), 0.1 ether, false);
        }
    }

    function buyTicket(uint256 ticketId) external payable {
        require(ticketId < TOTAL_TICKETS, "Invalid ticket ID");
        require(!tickets[ticketId].isSold, "Ticket already sold");
        require(msg.value >= tickets[ticketId].price, "Insufficient payment");

        tickets[ticketId].owner = msg.sender;
        tickets[ticketId].isSold = true;
    }

}
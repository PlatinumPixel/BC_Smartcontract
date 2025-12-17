// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Tickets {
    address public immutable owner;
    uint256 private _nextId;

    struct Ticket {
        uint256 id;
        address owner;
        uint256 price;
        bool isSold; 
    }

    Ticket[] public tickets;

    event TicketMinted(uint256 indexed ticketId, uint256 price, uint256 timestamp);
    event TicketPurchased(uint256 indexed ticketId, address indexed buyer, uint256 price, uint256 timestamp);
    event TicketListed(uint256 indexed ticketId, address indexed seller, uint256 newPrice, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    function mintTicket(uint256 price) external {
        require(msg.sender == owner, "Only owner can mint");
        uint256 ticketId = _nextId++;
        tickets.push(Ticket(ticketId, address(0), price, false));
        emit TicketMinted(ticketId, price, block.timestamp);
    }

    function buyTicket(uint256 ticketId) external payable {
        require(ticketId < tickets.length, "Invalid ticket ID");
        Ticket storage ticket = tickets[ticketId];

        require(!ticket.isSold, "Ticket already sold");
        require(msg.value >= ticket.price, "Insufficient payment");

        ticket.owner = msg.sender;
        ticket.isSold = true;
        emit TicketPurchased(ticketId, msg.sender, msg.value, block.timestamp);
    }

    function sellTicket(uint256 ticketId, uint256 newPrice) external {
        Ticket storage ticket = tickets[ticketId];

        require(msg.sender == ticket.owner, "Not the owner");
        require(ticket.isSold, "Ticket not sold yet");

        ticket.owner = address(0);
        ticket.price = newPrice;
        ticket.isSold = false;
        emit TicketListed(ticketId, msg.sender, newPrice, block.timestamp);
    }

    function getTicketCount() external view returns (uint256) {
        return tickets.length;
    }
}
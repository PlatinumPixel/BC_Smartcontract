const assert = require("assert");
const Ticket = artifacts.require("Tickets");

contract('Tickets', (accounts) => {
    const BUYER = accounts[1];
    const TICKET_ID = 0;

    it("should allow a user to buy a ticket", async () => {
        const instance = await Ticket.deployed();
        const originalTicket = await instance.tickets(TICKET_ID);
        await instance.buyTicket(TICKET_ID, { 
            from: BUYER,
            value: originalTicket.price 
        });
        const updatedTicket = await instance.tickets(TICKET_ID);
        assert.equal(
            updatedTicket.owner, 
            BUYER, 
            "Ticket owner was not updated correctly after purchase"
        );
    });
});
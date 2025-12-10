// tests/tickets.test.js
const assert = require("assert");
const Tickets = artifacts.require("Tickets");

contract("Tickets", (accounts) => {
    const [OWNER, BUYER1, BUYER2] = accounts;
    const TICKET_PRICE = web3.utils.toWei("0.1", "ether");

    let instance;

    beforeEach(async () => {
        instance = await Tickets.new({ from: OWNER });
    });

    describe("Ticket Minting", () => {
        it("should allow owner to mint tickets", async () => {
            await instance.mintTicket(TICKET_PRICE, { from: OWNER });
            const ticket = await instance.tickets(0);
            assert.equal(ticket.id.toNumber(), 0, "Ticket ID should be 0");
            assert.equal(ticket.price, TICKET_PRICE, "Price should match");
            assert.equal(ticket.owner, "0x0000000000000000000000000000000000000000", "Owner should be zero address");
            assert.equal(ticket.isSold, false, "Ticket should not be sold initially");
        });

        it("should prevent non-owners from minting", async () => {
            try {
                await instance.mintTicket(TICKET_PRICE, { from: BUYER1 });
                assert.fail("Non-owner should not be able to mint");
            } catch (err) {
                assert(err.message.includes("Only owner can mint"), "Expected error message");
            }
        });
    });

    describe("Ticket Buying", () => {
        beforeEach(async () => {
            await instance.mintTicket(TICKET_PRICE, { from: OWNER });
        });

        it("should allow buying available tickets", async () => {
            await instance.buyTicket(0, { from: BUYER1, value: TICKET_PRICE });
            const ticket = await instance.tickets(0);
            assert.equal(ticket.owner, BUYER1, "Owner should be updated");
            assert.equal(ticket.isSold, true, "Ticket should be marked as sold");
        });

        it("should prevent buying with insufficient funds", async () => {
            try {
                await instance.buyTicket(0, { from: BUYER1, value: web3.utils.toWei("0.05", "ether") });
                assert.fail("Should not allow underpayment");
            } catch (err) {
                assert(err.message.includes("Insufficient payment"), "Expected error message");
            }
        });

        it("should prevent buying already sold tickets", async () => {
            await instance.buyTicket(0, { from: BUYER1, value: TICKET_PRICE });
            try {
                await instance.buyTicket(0, { from: BUYER2, value: TICKET_PRICE });
                assert.fail("Should not allow buying sold tickets");
            } catch (err) {
                assert(err.message.includes("Ticket already sold"), "Expected error message");
            }
        });
    });

    describe("Ticket Selling", () => {
        beforeEach(async () => {
            await instance.mintTicket(TICKET_PRICE, { from: OWNER });
            await instance.buyTicket(0, { from: BUYER1, value: TICKET_PRICE });
        });

        it("should allow owner to sell their ticket", async () => {
            const newPrice = web3.utils.toWei("0.2", "ether");
            await instance.sellTicket(0, newPrice, { from: BUYER1 });
            const ticket = await instance.tickets(0);
            assert.equal(ticket.owner, "0x0000000000000000000000000000000000000000", "Owner should be reset");
            assert.equal(ticket.price, newPrice, "Price should be updated");
            assert.equal(ticket.isSold, false, "Ticket should be available again");
        });

        it("should prevent non-owners from selling", async () => {
            try {
                await instance.sellTicket(0, TICKET_PRICE, { from: BUYER2 });
                assert.fail("Non-owner should not be able to sell");
            } catch (err) {
                assert(err.message.includes("Not the owner"), "Expected error message");
            }
        });
    });
});
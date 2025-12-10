const Tickets = artifacts.require("Tickets");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Tickets, { from: accounts[0] });
};

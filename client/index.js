import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/Tickets.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

const createElementFromString = (htmlString) => {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}


const web3 = new Web3(
    Web3.givenProvider || "http://localhost:7545"
);

const contract = new web3.eth.Contract(
    CONTRACT_ABI, 
    CONTRACT_ADDRESS
);

let account;

const accountEl = document.getElementById("account");
const availableTicketsEl = document.getElementById("available-tickets");
const ownedTicketsEl = document.getElementById("owned-tickets");
const soldTicketsEl = document.getElementById("sold-tickets");
const mintSectionEl = document.getElementById("mint-section");


const buyTicket = async (ticket) => {
    await contract.methods
        .buyTicket(ticket.id)
        .send({ from: account, value: ticket.price });
    await refreshTickets();
}

const mintTicket = async (event) => {
    event.preventDefault();
    const priceInput = document.getElementById('mint-price');
    const price = priceInput.value;
    if (!price || isNaN(price) || Number(price) <= 0) {
        alert('Please enter a valid price in ETH');
        return;
    }
    const priceWei = web3.utils.toWei(price, 'ether');
    try {
        await contract.methods.mintTicket(priceWei).send({ 
            from: account,
            gas: 300000
        });
        priceInput.value = '';
        console.log('Ticket minted successfully');
        await refreshTickets();
    } catch (error) {
        console.error('Minting failed:', error);
        alert('Failed to mint ticket: ' + error.message);
    }
}

const sellTicket = async (ticket) => {
    const newPrice = prompt('Enter new price in ETH to sell this ticket:');
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
        alert('Please enter a valid price in ETH');
        return;
    }
    const priceWei = web3.utils.toWei(newPrice, 'ether');
    await contract.methods.sellTicket(ticket.id, priceWei).send({ from: account });
    await refreshTickets();
}


const refreshTickets = async () => {
    availableTicketsEl.innerHTML = '';
    ownedTicketsEl.innerHTML = '';
    soldTicketsEl.innerHTML = '';
    
    let total = 0;
    try {
        while (true) {
            await contract.methods.tickets(total).call();
            total++;
        }
    } catch (e) {
    }

    console.log('Total tickets found:', total);

    const availableTickets = [];
    const ownedTickets = [];
    const soldTickets = [];

    for (let i = 0; i < total; i++) {
        const ticket = await contract.methods.tickets(i).call();
        console.log('Ticket', i, ':', ticket);
        ticket.id = i;
        
        if (ticket.owner === '0x0000000000000000000000000000000000000000') {
            availableTickets.push(ticket);
        } else if (ticket.owner.toLowerCase() === account.toLowerCase()) {
            ownedTickets.push(ticket);
        } else {
            soldTickets.push(ticket);
        }
    }

    // Render available tickets
    if (availableTickets.length > 0) {
        availableTicketsEl.innerHTML = '<h3 class="mb-3">Available Tickets</h3><div class="tickets-grid"></div>';
        const grid = availableTicketsEl.querySelector('.tickets-grid');
        availableTickets.forEach(ticket => {
            const ticketEl = createElementFromString(`
                <div class="ticket card" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">Ticket #${ticket.id}</h5>
                        <p class="card-text">Price: ${web3.utils.fromWei(ticket.price, 'ether')} ETH</p>
                        <button class="btn btn-primary">Buy Ticket</button>
                    </div>
                </div>
            `);
            const button = ticketEl.querySelector('button');
            button.onclick = buyTicket.bind(null, ticket);
            grid.appendChild(ticketEl);
        });
    }

    // Render owned tickets
    if (ownedTickets.length > 0) {
        ownedTicketsEl.innerHTML = '<h3 class="mb-3 mt-4">Your Tickets</h3><div class="tickets-grid"></div>';
        const grid = ownedTicketsEl.querySelector('.tickets-grid');
        ownedTickets.forEach(ticket => {
            const ticketEl = createElementFromString(`
                <div class="ticket card border-success" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">Ticket #${ticket.id}</h5>
                        <p class="card-text">You own this ticket</p>
                        <button class="btn btn-warning">Sell Ticket</button>
                    </div>
                </div>
            `);
            const button = ticketEl.querySelector('button');
            button.onclick = sellTicket.bind(null, ticket);
            grid.appendChild(ticketEl);
        });
    }

    // Render sold tickets
    if (soldTickets.length > 0) {
        soldTicketsEl.innerHTML = '<h3 class="mb-3 mt-4">Sold Tickets</h3><div class="tickets-grid"></div>';
        const grid = soldTicketsEl.querySelector('.tickets-grid');
        soldTickets.forEach(ticket => {
            const ticketEl = createElementFromString(`
                <div class="ticket card border-secondary" style="width: 18rem; opacity: 0.6;">
                    <div class="card-body">
                        <h5 class="card-title">Ticket #${ticket.id}</h5>
                        <p class="card-text">Sold</p>
                    </div>
                </div>
            `);
            grid.appendChild(ticketEl);
        });
    }
}

const updateAccount = (acc) => {
    account = acc;
    accountEl.innerText = `Connected account: ${account}`;
    renderMintSection();
};

const renderMintSection = async () => {
    let contractOwner;
    try {
        contractOwner = await contract.methods.owner().call();
        if (!contractOwner || contractOwner === '0x0000000000000000000000000000000000000000') {
            mintSectionEl.innerHTML = '<div class="alert alert-danger">Could not fetch contract owner. Check contract address and ABI.</div>';
            return;
        }
    } catch (e) {
        mintSectionEl.innerHTML = `<div class="alert alert-danger">Error fetching contract owner: ${e.message}</div>`;
        return;
    }
    if (account && contractOwner && account.toLowerCase() === contractOwner.toLowerCase()) {
        mintSectionEl.innerHTML = `
            <form id="mint-form" class="d-flex align-items-end">
                <div class="form-group me-2">
                    <label for="mint-price" class="form-label">Mint Ticket Price (ETH):</label>
                    <input type="number" min="0.0001" step="0.0001" class="form-control" id="mint-price" placeholder="e.g. 0.1" required>
                </div>
                <button type="submit" class="btn btn-success">Mint Ticket</button>
            </form>
        `;
        document.getElementById('mint-form').onsubmit = mintTicket;
    } else {
        mintSectionEl.innerHTML = '';
    }
};

const main = async () => {
    try {
        if (!window.ethereum) {
            accountEl.innerText = 'MetaMask is not installed';
            console.error('MetaMask not found');
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        updateAccount(accounts[0]);

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                updateAccount(accounts[0]);
                refreshTickets();
            } else {
                accountEl.innerText = 'MetaMask disconnected';
                mintSectionEl.innerHTML = '';
            }
        });
        await refreshTickets();
    } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        accountEl.innerText = `Error: ${error.message}`;
    }
};

main();
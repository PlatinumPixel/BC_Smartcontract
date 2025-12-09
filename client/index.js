import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/Tickets.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;
const TOTAL_TICKETS = 10;

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
const ticketsEl = document.getElementById("tickets");

const refreshTickets = async () => {
    ticketsEl.innerHTML = '';
    for (let i = 0; i < TOTAL_TICKETS; i++) {
        const ticket = await contract.methods.tickets(i).call();
        console.log(ticket);
        ticket.id = i;
        if (ticket.owner === '0x0000000000000000000000000000000000000000') {
            const ticketEl = createElementFromString(`
                <div class="ticket card" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">Ticket #${ticket.id}</h5>
                        <p class="card-text">Price: ${web3.utils.fromWei(ticket.price, 'ether')} ETH</p>
                        <button class="btn btn-primary" id="buy-ticket-${ticket.id}">Buy Ticket</button>
                    </div>
                </div>
            `);
            ticketsEl.appendChild(ticketEl);
        }
    }
}
const updateAccount = (acc) => {
    account = acc;
    accountEl.innerText = `Connected account: ${account}`;
};

const main = async () => {
    try {
        // Check if MetaMask is installed
        if (!window.ethereum) {
            accountEl.innerText = 'MetaMask is not installed';
            console.error('MetaMask not found');
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        updateAccount(accounts[0]);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                updateAccount(accounts[0]);
            } else {
                accountEl.innerText = 'MetaMask disconnected';
            }
        });
        await refreshTickets();
    } catch (error) {
        console.error('Failed to connect to MetaMask:', error);
        accountEl.innerText = `Error: ${error.message}`;
    }
};

main();
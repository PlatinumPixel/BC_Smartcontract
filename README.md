# Web3 Bilieto DApp

Decentralizuota bilietų prekyvietė, sukurta Ethereum blokoje naudojant Solidity išmaniuosius kontraktus ir web3 integraciją. Naudotojai gali pirkti, parduoti ir kurti bilietus per patogią sąsają, sujungtą su MetaMask piniginės.

## Funkcijos

### Išmanaus Kontrakto Funkcijos
- **Bilietų Kūrimas**: Kontrakto savininkas gali kurti naujus bilietus nurodydamas jų kainas
- **Bilietų Nusipirkimas**: Naudotojai gali pirkti prieinamus bilietus tiesiogiai iš blokų grandinės
- **Bilietų Pardavimas/Perpardavimas**: Bilietų savininkai gali siūlyti savo bilietus perpardavimui su naujomis kainomis
- **Įvykių Sekimas**: Visos operacijos išduoda įvykius skaidrumui ir sekimui

### Priekinės Dalies Funkcijos
- **MetaMask Integravimas**: Beproblemė piniginės sujungimo ir operacijų pasirašymo sistema
- **Organizuota Bilietų Rodyba**: Bilietai suskirstyti į tris kategorijas:
  - **Prieinami Bilietai**: Bilietai pardavimui (su Pirkti mygtukai)
  - **Jūsų Bilietai**: Jūsų turimi bilietai (su Parduoti mygtukai)
  - **Parduoti Bilietai**: Bilietai, kuriuos turi kiti (tik skaitymui)
- **Administratoriaus Bilietų Kūrimas**: Kontrakto savininkas gali kurti bilietus dedikuotoje 

## Projekto Struktūra

```
truffle/
├── contracts/
│   └── Tickets.sol              # Pagrindinis išmanusis kontraktas
├── migrations/
│   └── 1_deploy_contracts.js   # Diegimo scenarijus
├── test/
│   └── ticket.js               # Kontrakto testai
├── build/
│   └── contracts/
│       └── Tickets.json        # Kompiliuotas kontraktas ABI ir bytecode
├── client/
│   ├── index.html              # Pagrindinė HTML byla
│   ├── index.js                # Priekinės dalies logika
│   ├── style.css               # Pasirinktiniai stiliai
│   └── package.json            # Priekinės dalies priklausomybės
├── truffle-config.js           # Truffle konfigūracija
└── README.md                   # Šis failas
```

## Darbo Pradžia

### Reikalavimai
- Node.js (v14 arba naujesnė versija)
- MetaMask naršyklės plėtinys
- Ganache CLI arba Ganache GUI

### Diegimas

1. **Atsisiųskite arba klonuokite projektą**
   ```bash
   cd truffle
   ```

2. **Diegiame kontrakto priklausomybes**
   ```bash
   npm install
   ```

3. **Diegiame priekinės dalies priklausomybes**
   ```bash
   cd client
   npm install
   cd ..
   ```

### Projekto Paleidimas

1. **Paleidžiame Ganache** (vietinė blokų grandinė)
   ```bash
   ganache-cli
   # arba naudokite Ganache GUI
   ```
   Įsitikinkite, kad jis veikia adresu `http://localhost:7545` su tinklo ID `5777`

2. **Kompiliuojame išmanųjį kontraktą**
   ```bash
   truffle compile
   ```

3. **Diegiame kontraktą**
   ```bash
   truffle migrate
   ```

4. **Paleidžiame priekinės dalies kūrimo serverį**
   ```bash
   cd client
   npm start
   ```

5. **Atvertas naršyklėje**
   - Eikite į `http://localhost:1234` (arba URL, rodytą Parcel)
   - Sujunkite MetaMask su savo vietine Ganache tinklu
   - Įsitikinkite, kad MetaMask sujungtas su pirmuoju paskyra (kontrakto savininkas)

### Testavimas

Paleiskite testų paketą:
```bash
truffle test
```

Testai apima:
- Bilietų kūrimą (tik savininkas)
- Bilietų nusipirkimą
- Bilietų perpardavimą
- Leidimo patvirtinimą

## Išmanaus Kontrakto API

### Funkcijos

#### `mintTicket(uint256 price)`
- **Aprašymas**: Sukurta naują bilietą
- **Apribojimai**: Tik kontrakto savininkas
- **Parametrai**: 
  - `price`: Bilieto kaina Wei
- **Išduoda**: `TicketMinted` įvykis

#### `buyTicket(uint256 ticketId)`
- **Aprašymas**: Nusipirkti prieinamą bilietą
- **Parametrai**: 
  - `ticketId`: Perkamo bilieto ID
- **Reikalavimai**: Nurodyta pakankama ETH suma
- **Išduoda**: `TicketPurchased` įvykis

#### `sellTicket(uint256 ticketId, uint256 newPrice)`
- **Aprašymas**: Išvardyti turimo bilieto perpardavimą
- **Parametrai**: 
  - `ticketId`: Parduodamo bilieto ID
  - `newPrice`: Nauja kaina Wei
- **Apribojimai**: Tik bilieto savininkas
- **Išduoda**: `TicketListed` įvykis

#### `getTicketCount() → uint256`
- **Aprašymas**: Gauti bendras bilietų skaičius
- **Grąžina**: Bendras bilietų skaičius

#### `tickets(uint256 id) → Ticket`
- **Aprašymas**: Gauti bilieto informaciją
- **Parametrai**: 
  - `id`: Bilieto ID
- **Grąžina**: Bilieto struktūra su id, savininku, kaina, isSold

#### `owner() → address`
- **Aprašymas**: Gauti kontrakto savininko adresą
- **Grąžina**: Savininko adresas (neapmokamas)

### Įvykiai

```solidity
event TicketMinted(uint256 indexed ticketId, uint256 price, uint256 timestamp);
event TicketPurchased(uint256 indexed ticketId, address indexed buyer, uint256 price, uint256 timestamp);
event TicketListed(uint256 indexed ticketId, address indexed seller, uint256 newPrice, uint256 timestamp);
```

## Sekos Diagrama

![Sequence diagram.](/img/s.drawio.png)   


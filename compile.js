const solc = require('solc')
const path = require('path');
const fs = require('fs');
let contract;
let cachePath = path.join(__dirname, 'contracts', 'funding-cache.json');
let isCompile= true;
if (isCompile){
    let contractPath = path.join(__dirname, 'contracts', 'crowdfunding.sol');
    let contractFile = fs.readFileSync(contractPath, 'utf-8');
     contract = solc.compile(contractFile, 1);
    fs.writeFileSync(cachePath,JSON.stringify(contract));
} else {
    let readFileSync = fs.readFileSync(cachePath, 'utf-8');
    contract = JSON.parse(readFileSync);
}
module.exports = {
    funding: contract.contracts[':Funding'],
    factory: contract.contracts[':FundingFactory']
}


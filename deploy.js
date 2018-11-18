let {funding, factory} = require('./compile');
const Web3 = require('web3');
let HDWalletProvider = require("truffle-hdwallet-provider");
let mnemonic = "estate exhibit speed isolate corn coconut loud vacant slow lobster garlic inhale"; // 12 word mnemonic
let provider = new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/32fcbba136c346708703f0b930cca26d");
let web3 = new Web3(provider);
deploy = async () => {
    let accounts = await web3.eth.getAccounts();
    let estimateGas = await web3.eth.estimateGas({
        data: "0x" + factory.bytecode
    });
    let contract = await new web3.eth.Contract(JSON.parse(factory.interface))
        .deploy({
        data: factory.bytecode,
        arguments: []
    }).send({
        from: accounts[0],
        gas: estimateGas
    }) ;
    console.log(contract.options.address)     //
    console.log(`factoryAPI:${factory.interface}`);
    console.log(`fundingAPI:${funding.interface}`);
};
deploy();
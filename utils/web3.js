let Web3 = require('web3');
let HDWalletProvider = require("truffle-hdwallet-provider");

let web3;

let readOnly = false;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    // 检查web3是否安装
    web3 = new Web3(window.web3.currentProvider);
    console.log('Injected web3 detected.');
} else if(readOnly){
    // 如果没有采用infura的http的web3 (metamask)
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/b5193966085f4ae0a469a7a77215b0ba'
    );
    web3 = new Web3(provider);
    console.log('No web3 instance injected, using HttpProvider rinkeby web3.');
} else {
    // rinkeby网络的 包含mnemonic的truffle-hdwallet-provider 用于后台开发测试
    let mnemonic = '助记词';
    const provider = new HDWalletProvider(mnemonic,'https://rinkeby.infura.io/v3/82a59ec1db144c82873d6a0f937e4d4a');
    web3 = new Web3(provider);
    console.log('Using rinkeby web3 with mnemonic');
}

module.exports = web3;
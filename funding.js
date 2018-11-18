let {funding, factory} = require('./compile');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
// let ganache = require('ganache-cli');
// let web3 = new Web3(ganache.provider());
let mnemonic = "estate exhibit speed isolate corn coconut loud vacant slow lobster garlic inhale"; // 12 word mnemonic
let provider = new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/32fcbba136c346708703f0b930cca26d");
let web3 = new Web3(provider);
let ffcontract;
let fundingContract;
deploy = async () => {
    let accounts = await web3.eth.getAccounts();
    let estimateGas = await web3.eth.estimateGas({
        data: "0x" + factory.bytecode
    });
    // console.log(estimateGas);
    ffcontract = await new web3.eth.Contract(JSON.parse(factory.interface))
        .deploy({
            data: factory.bytecode,
            arguments: []
        }).send({
            from: accounts[0],
            gas: estimateGas
        }) ;
    // console.log(contract.options.address)
    fundingContract=  await new web3.eth.Contract(JSON.parse(funding.interface))
};

/*

web3js封装函数

- 路人
    - 查看所有众筹项目列表 2 @
    - 根据项目地址获取项目详情 (名称, 结束时间, 目标金额, 参与金额, 人数) 2.5
    - 参与众筹项目 3 @
- 众筹创建者
    - 发起众筹 1 @
    - 查看自己创建的众筹项目列表 4 @
    - 发起付款请求 6 @
    - 完成付款操作 8 @
- 众筹参与者
    - 查看自己参与的众筹项目列表 5 @
    - 查看指定众筹项目的付款请求列表 7  @
    - 审核批准付款请求 7.5

- 获取当前账户地址 0 @
*/
before(async ()=>{
    await  deploy();
}) ;

describe('测试众筹合约', ()=> {
    let accounts;
    let fundings;
    it('获取帐号',async function () {
        accounts = await web3.eth.getAccounts();
        console.log(accounts[0]);
    });
    it('1.发起众筹', async () =>{
        let result= await ffcontract.methods.createFunding('小夜灯',99,300).send({
            from:accounts[0],
            gas:'3000000'
        });
        result= await ffcontract.methods.createFunding('菜刀',20,100).send({
            from:accounts[0],
            gas:'3000000'
        })
        // console.log(result);
    });
    it('查看所有众筹项目列表 2', async () =>{
        fundings= await ffcontract.methods.getFundings().call();
        console.log(fundings);
    });
    it('参与众筹项目 3', async ()=> {
        fundingContract.options.address = fundings[0] ;
        // console.log(fundingContract);
        await fundingContract.methods.support().send({
            from:accounts[0],
            value:99,
            gas:"3000000"
        }) ;
        // await fundingContract.methods.support().send({
        //     from:accounts[1],
        //     value:99,
        //     gas:"3000000"
        // }) ;
        // await fundingContract.methods.support().send({
        //     from:accounts[2],
        //     value:99,
        //     gas:"3000000"
        // })
    });
    it('查看自己创建的众筹项目列表 4', async ()=> {
        let result=  await ffcontract.methods.getCreatorFundings().call({
            from:accounts[0]
        });
        console.log(result);
    });
    it('查看自己参与的众筹项目列表 5', async ()=> {
        let result=  await ffcontract.methods.getPlayerFundings().call({
            from:accounts[0]
        });
        console.log(result);
    });
    it('发起付款请求 6', async ()=> {
        fundingContract.options.address = fundings[0] ;
        await fundingContract.methods.createRequet('买灯泡',50,accounts[0]).send({
            from:accounts[0],
            gas:"3000000"
        })
    });
    // describe('7 查看请求',  ()=> {
    it('7查看指定众筹项目的付款请求列表', async ()=> {
        fundingContract.options.address = fundings[0];
        let result=  await fundingContract.methods.requests(0).call();
        console.log(result);
    });
    it('7.5审批请求', async ()=> {
        await fundingContract.methods.approveRequest(0).send({
            from:accounts[0],
            gas:"3000000"
        }) ;
        // await fundingContract.methods.approveRequest(0).send({
        //     from:accounts[2]
        // }) ;
        let result=  await fundingContract.methods.requests(0).call();
        console.log(result);
    });


    it('完成付款操作 8', async ()=> {
        let money= await fundingContract.methods.showtContractMoney().call();
        console.log(money);
        await fundingContract.methods.finalizeRequest(0).send({
            from:accounts[0],
            gas:"3000000"
        }) ;

        let result=  await fundingContract.methods.requests(0).call();
        console.log(result);
    });

});


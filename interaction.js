let {ffContract, fundingContract} = require("./contracts_optimize");
let web3 = require("./utils/web3");
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
/**
 * 获取账户信息
 * @returns {*}
 */
getAccounts = () => {
    return web3.eth.getAccounts();
};

/**
 * 创建众筹项目
 * @param _projectName  项目名称
 * @param _supportMoney 参与金额
 * @param _goalMoney    目标金额
 * @returns {Promise<*>}
 */
createFunding = async (_projectName, _supportMoney, _goalMoney) => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0])
    let result = await ffContract.methods.createFunding(_projectName, _supportMoney, _goalMoney).send({
        from: accounts[0],
        gas: "3000000"
    });
    return result
};

/**
 * 根据合约地址获取详情
 * @param fundingAdresses   合约地址
 * @returns {Promise<*>}
 */
getDetails = (adr) => {
    return new Promise(async (resolve, reject) => {
        try {
            fundingContract.options.address = adr;
            let details = await fundingContract.methods.details().call();
            resolve({
                address: adr,
                ...details
            });
        } catch (e) {
            reject(e);
        }
    })
};

/**
 *  获取所有众筹项目
 * @param type  获取类型 0：获取所有  1：我创建的  2：我参与的
 * @returns {Promise<Array>}   众筹项目地址数据Promise
 */
getFundings = async (type) => {
    let fundings = [];
    let fundingAdresses = [];
    let accounts = await web3.eth.getAccounts();
    switch (type) {
        case 1:
            fundingAdresses = await ffContract.methods.getCreatorFundings().call({from: accounts[0]});
            break;
        case 2:
            fundingAdresses = await ffContract.methods.getPlayerFundings().call({from: accounts[0]});
            break;
        default:
            fundingAdresses = await ffContract.methods.getFundings().call();
    }
    let promises = fundingAdresses.map(adr => getDetails(adr));
    fundings = await  Promise.all(promises);
    // fundingAdresses.forEach(async (adr, i) => {
    //     const details = await getDetails(adr);
    //     console.log(`详情:${JSON.stringify(details)}   `)
    //     fundings.push(details);
    // });
    return fundings;
};
support = async (address) => {
    fundingContract.options.address = address;
    let accounts = await web3.eth.getAccounts();
    let supportMoney = await  fundingContract.methods.supportMoney().call();
    return await fundingContract.methods.support().send({from: accounts[0], value: supportMoney, gas: "3000000"});
};
// getCreatorFundings = async () => {
//     let accounts = await web3.eth.getAccounts();
//     return await ffContract.methods.getCreatorFundings().call({from: accounts[0]})
// };
// getPlayerFundings = async () => {
//     let accounts = await web3.eth.getAccounts();
//     return await ffContract.methods.getPlayerFundings().call({from: accounts[0]})
// };
createRequest = async (address, _description, _money, _shopAdress) => {
    console.log(address);
    fundingContract.options.address = address;
    let accounts = await web3.eth.getAccounts();
    return fundingContract.methods.createRequet(_description, _money, _shopAdress).send({
        from: accounts[0],
        gas: "3000000"
    });
};
//获取全部请求详情
requests = async (address) => {
    fundingContract.options.address = address;
    let count = await fundingContract.methods.getRequest().call();//拿到请求个数
    let arr = Array.from({length: count});
    console.log(arr.length);
    let arrPromise = arr.map((n, i) => getRequestDetail(address, i));
    let result = await Promise.all(arrPromise);
    return result;
};
//获取单个请求详情
getRequestDetail = async (address, index) => {
    fundingContract.options.address = address;
    return await fundingContract.methods.requests(index).call();
}
approveRequest = async (address, index) => {
    fundingContract.options.address = address;
    let accounts = await web3.eth.getAccounts();
    await fundingContract.methods.approveRequest(index).send({from: accounts[0], gas: "3000000"});
};
finalizeRequest = async (address, index) => {
    fundingContract.options.address = address;
    let accounts = await web3.eth.getAccounts();
    await fundingContract.methods.finalizeRequest(index).send({from: accounts[0], gas: "3000000"});
};

module.exports = {
    getAccounts,
    createFunding,
    getFundings,
    support,
    createRequest,
    requests,
    approveRequest,
    finalizeRequest
};


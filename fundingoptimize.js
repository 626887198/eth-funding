let interaction = require("./interaction");
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

describe('测试众筹合约', () => {
    let accounts;
    let fundings; // 所有合约的详情
    it('0 获取当前账户地址', async () => {
        accounts = await interaction.getAccounts();
        console.log(`accounts[0]: ` + accounts[0]);
    });

    it('1 发起众筹', async () => {
        let result = await interaction.createFunding("大夜灯", 99, 1000);
        console.log(result);
    });

    // { '0': '0xa6c7DD132f19ECDa0295eC726D1445ACf367fA2A', //manager address
    //     '1': '蓝牙耳机',  //projectName
    //     '2': '99',     //support
    //     '3': '29',     //剩余天数
    //     '4': '1000',     //goalMoney
    //     '5': '0',         //playersCount
    //     address: '0xaD12D4C735DdC84553ebca6dB66077f83Cda86Fb' //contractAddress}
    it('2 查看所有众筹项目列表', async () => {
        fundings = await interaction.getFundings();
        console.log(fundings);
    });
    it('3 参与众筹项目', async () => {
        // 参与哪个项目fundings[0];
        console.log(fundings[fundings.length-1].address) ;
        let result = await interaction.support(fundings[fundings.length-1].address);
        console.log(result);
    });

    it('4 查看自己创建的众筹项目列表', async () => {
        const arr = await interaction.getFundings(1);
        console.log(arr);
    });

    it('5 查看自己参与的众筹项目列表', async () => {
        const arr = await interaction.getFundings(2);
        console.log(arr);

    });
    it('6 发起付款请求', async () => {
        console.log(fundings[fundings.length-1].address);
        let result = await interaction.createRequest(fundings[fundings.length-1].address,"买电池", 50, '0xa6c7DD132f19ECDa0295eC726D1445ACf367fA2A');
        result = await interaction.createRequest(fundings[fundings.length-1].address,"买灯泡", 10, '0xa6c7DD132f19ECDa0295eC726D1445ACf367fA2A');
        console.log(result);
    });
    // describe('7 查看并审批付款请求', async () => {
    it('7 查看指定众筹项目的付款请求列表', async () => {
        const request = await interaction.requests(fundings[fundings.length-1].address);
        console.log(request);
    });
    it('7.5 审批请求', async () => {
        await interaction.approveRequest(fundings[fundings.length-1].address,0);
        // await fundingContract.methods.approveRequest(0).send({from: accounts[0], gas: "3000000"});
        const request = await interaction.requests(fundings[fundings.length-1].address,0);
        console.log(request);
    });
    // });
    it('8 完成付款操作', async () => {
        await interaction.finalizeRequest(fundings[fundings.length-1].address,0);
        const request = await interaction.requests(fundings[fundings.length-1].address,0);
        console.log(request);
    });

});
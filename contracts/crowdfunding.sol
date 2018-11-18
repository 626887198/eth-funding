pragma solidity ^0.4.25;

contract  PlayerToFundings{
    // 参与者=> 合约地址数组 (参与者所有参与的合约)
    mapping(address=>address[]) playerToFundings;
    function join(address adr,address fundingAdr) public{
        playerToFundings[adr].push(fundingAdr);
    }
    //返回某个参与者参加的所有合约
    function getPlayerFundings(address adr) public view returns(address[]){
        return playerToFundings[adr];
    }
}
contract FundingFactory{
    //存储所有已经部署的智能合约的地址
    address[] public fundings;
    // 创建者=> 合约地址数组 （创建者创建的所有合约）
    mapping(address=>address[]) public createToFundings;

    PlayerToFundings p2f;

    constructor() public{
        address p2fAddress=new PlayerToFundings();
        p2f=PlayerToFundings(p2fAddress);
    }
    //创建众筹合约
    function createFunding(string _projectName,uint _supportMoney,uint _goalMoney) public {
        address funding=  new Funding(_projectName,_supportMoney,_goalMoney,msg.sender,p2f);
        fundings.push(funding);
        createToFundings[msg.sender].push(funding);
    }
    //获取所有已部署的众筹合约
    function getFundings() public view returns(address[]){
        return fundings;
    }
    //获取当前参与者创建的所有合约
    function getCreatorFundings() public view returns(address[]){
        return  createToFundings[msg.sender];
    }

    //获取当前参与者参与的所有活动
    function getPlayerFundings() public view returns(address[]){
        return  p2f.getPlayerFundings(msg.sender);
    }
}
contract Funding{

    // 众筹成功标记
    bool public flag = false;
    //众筹发起人地址(众筹发起人)
    address  public manager;
    //项目名称
    string public projectName;
    //众筹参与人需要付的钱
    uint public supportMoney;
    //默认众筹结束的时间,为众筹发起后的一个月
    uint public endTime;
    //目标募集的资金(endTime后,达不到目标则众筹失败)
    uint public goalMoney;
    //众筹参与人的数组
    address[] public players;
    //用来存储已参与的人，MAPPING方便查询
    mapping(address=>bool) playersMap;
    //付款请求体
    struct Request{
        string  description  ;
        uint money;
        address shopAdress;
        bool complete;
        //支持人数
        uint votedCount;
        mapping(address=>bool) votedMap;
    }
    // 请求数组  （目前版本还不支持方法返回结构体，只能通过public查看 ）
    Request[] public requests;

    PlayerToFundings p2f;

    //构造函数   构造函数不允许传mapping 所以采用合约的方式传P2F 也可以用结构体的方式
    constructor(string _projectName,uint _supportMoney,uint _goalMoney,address adr,PlayerToFundings _p2f) public {
        manager=adr;
        projectName=_projectName;
        supportMoney=_supportMoney;
        goalMoney=_goalMoney;
        endTime = now + 60*60*24*30;
        p2f=_p2f;
    }

    //参与众筹，需要支付
    function support()public payable {
        //不能重复参与
        require(!playersMap[msg.sender]);
        require(msg.value==supportMoney);
        players.push(msg.sender);
        playersMap[msg.sender]=true;
        p2f.join(msg.sender,address(this));

    }
    //创建购买请求
    function createRequet(string _description,uint _money,address _shopAdress) public onlyManagerCall{
        //合同余额必须大于该请求的金额
        require(address(this).balance>=_money);
        Request memory request = Request({
            description:_description,
            money:_money,
            shopAdress:_shopAdress,
            complete:false,
            votedCount:0
            });
        requests.push(request);
    }
    //付款批准函数, 由众筹参与人调用
    function approveRequest(uint index) public {
        //批复者必须是参与人
        require(playersMap[msg.sender]);
        //storage表示传址，操作同一个对象
        Request storage request =requests[index];
        //投票者必须是第一次投票
        require(!request.votedMap[msg.sender]);
        request.votedCount++;
        request.votedMap[msg.sender]=true;
    }

    //众筹发起人调用, 可以调用完成付款
    function finalizeRequest(uint index) public payable onlyManagerCall{
        //拿到请求
        Request storage request =requests[index];
        //请求必须是未完成
        require(!request.complete);
        //合约够钱
        require(address(this).balance>=request.money);
        //支持人数过半
        require(request.votedCount*2>getPlayersCount());
        //转账
        request.shopAdress.send(request.money);
        //更改请求状态
        request.complete=true;
    }
    //获取请求的个数(因为返回值不能是结构体,只能一个一个查)
    function getRequest() public view returns(uint){
        return requests.length;
    }

    //获取合约余额
    function showtContractMoney() public view returns(uint){
        return address(this).balance;
    }
    //获取所有参与者
    function getPlayers() public view returns(address[]){
        return players;
    }

    //获取参与人数
    function getPlayersCount() public view returns(uint){
        return players.length;
    }
    //获取结束时间
    function getENDTime() public view returns(uint){
        return (endTime-now)/60/60/24;
    }
    // 检查众筹状态
    function checkState()public  onlyManagerCall{
        require(!flag);
        //时间到
        require(now>endTime);
        //合约金额大于目标金额
        require(address(this).balance>=goalMoney);
        flag=true;
    }

    //查看合约详情
    function details() public view returns(address,string,uint,uint,uint,uint){
        return(manager,projectName,supportMoney,getENDTime(),goalMoney,getPlayersCount());
    }

    modifier onlyManagerCall(){
        require(msg.sender==manager);
        _;
    }
}
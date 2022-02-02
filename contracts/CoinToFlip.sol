pragma solidity ^0.4.24;

contract CoinToFlip {

    uint constant MAX_CASE = 2;
    uint constant MIN_BET = 0.01 ether;
    uint constant MAX_BET = 10 ether;
    uint constant HOUSE_FEE_PERCENT = 5;
    uint constant HOUSE_MIN_FEE = 0.1 ether;

    address public owner;
    uint public lockedInBets;

    struct Bet {
        uint amount;
        uint8 numOfBetBit;
        uint placeBlockNumber;
        uint8 mask;
        address gambler; 
    }

    mapping (address => Bet) bets;

    event Reveal(uint reveal);
    event Payment(address indexed veneficiary, uint amount);
    event FailedPayment(address indexed venficiary, uint amount);


    constructor () public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require (msg.sender == owner, "Only owner can call this function.");
        _;
    }

    //Funds withdrawal to maintain the house
    function withdrawFunds(address beneficiary, uint withdrawAmount) external onlyOwner {
        require (withdrawAmount + lockedInBets <= address(this).balance, "larger than balance.");
        sendFunds(beneficiary, withdrawAmount);
    }

    function sendFunds(address beneficiary, uint amount) private {
        if (beneficiary.send(amount)) {
            emit Payment(beneficiary, amount);
        } else {
            emit FailedPayment(beneficiary, amount);
        }
    }

    function kill() external onlyOwner {
        require (lockedInBets == 0 , "All bets should be processed before self-destruct.");
        selfdestruct(owner);
    }


    //FALL BACK 초기 운영자금을 넣을수있음
    function () public payable {}

    //Bet by player
    function placeBet(uint8 betMask) external payable {

        uint amount = msg.value;

        require (amount >= MIN_BET && amount <= MAX_BET, "Amount is out of range.");
        require (betMask > 0 && betMask <256, "Mask should be 8 bit");

        Bet storage bet = bets[msg.sender]; //mapping bets(address =>Bet)
        //Bet bet = bets[msg.sender];

        require (bet.gambler == address(0), "Bet Should be empty state.");  // can place a bet
        //if (bet.gambler == null) X

        //count bet bit in the betMask
        //0000 0011 number of bits = 2
        //0000 0001 number of bits = 1
        uint8 numOfBetBit = countBits(betMask);

        bet.amount = amount;
        bet.numOfBetBit = numOfBetBit;
        bet.placeBlockNumber = block.number;
        bet.mask = betMask;
        bet.gambler = msg.sender;

        //need to lock possible winning amount to pay
        uint possibleWinningAmount = getWinningAmount(amount, numOfBetBit);
        lockedInBets += possibleWinningAmount;

        // Check whether house has enough ETH to pay the bet.
        require (lockedInBets < address(this).balance, "Cannot affor to pay the bet.");

    }

    function getWinningAmount(uint amount, uint8 numOfBetBit) private pure returns (uint winningAmount) {

        require (0 < numOfBetBit && numOfBetBit <MAX_CASE, "probability is out of range");

        uint houseFee = amount * HOUSE_FEE_PERCENT /100;

        if (houseFee < HOUSE_MIN_FEE) {
            houseFee = HOUSE_MIN_FEE;
        }

        uint reward = amount / (MAX_CASE + (numOfBetBit-1));

        winningAmount = (amount-houseFee) + reward;
    }

    function revealResult(uint seed) external {

        Bet storage bet = bets[msg.sender];
        uint amount = bet.amount;
        uint8 numOfBetBit = bet.numOfBetBit;
        uint placeBlockNumber = bet.placeBlockNumber;
        address gambler = bet.gambler;

        require(amount >0, "Bet should be in an 'active' state");

        require(block.number >placeBlockNumber, "revealResult in the same block as placeBet, or before.");

        //RNG(random Number Generator)
        bytes32 random = keccak256(abi.encodePacked(blockhash(block.number-seed), blockhash(placeBlockNumber)));
        
        uint reveal = uint(random) % MAX_CASE;

        uint winningAmount = 0;
        uint possibleWinningAmount = 0;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        if((2**reveal) & bet.mask != 0) {
            winningAmount = possibleWinningAmount;
        }

        emit Reveal( 2** reveal);

        if (winningAmount >0) {
            sendFunds(gambler, winningAmount);
        }

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);
    }

    function clearBet(address player) private {
        Bet storage bet = bets [player];

        if (bet.amount > 0) {
            return;
        }

        bet.amount = 0;
        bet.numOfBetBit = 0;
        bet.mask = 0;
        bet.gambler = address(0);
    }

    function refundBet() external {
        require(block.number > bet.placeBlockNumber, "");

        Bet storage bet = bets[msg.sender];
        uint amount = bet.amount;

        require (amount > 0, "Bet should be in an 'active' state");

        uint8 numOfBetBit = bet.numOfBetBit;

        //send the refund.
        sendFunds(bet.gambler, amount);

        uint possibleWinningAmount;
        possibleWinningAmount = getWinningAmount(amount, numOfBetBit);

        lockedInBets -= possibleWinningAmount;
        clearBet(msg.sender);
    }

    function checkHouseFund() public view onlyOwner returns(uint) {
        return address(this).balance;
    }

    function countBits(uint8 _num) internal pure returns (uint8) {
        uint8 count;
        while (_num >0) {
            count += _num & 1;
            _num >>=1;
        }
        return count;
    }

}
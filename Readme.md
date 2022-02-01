리액트로 구현하는 블록체인 이더리움 Dapp
https://inf.run/buAJ

prosper blood teach genius drama island learn dash critic immune bomb quality

---version
tuffle4, node8,

PS C:\GitWorkspace\react-dapp> truffle version
Truffle v4.1.17 (core: 4.1.17)
Solidity v0.4.26 (solc-js)   

PS C:\GitWorkspace\react-dapp> npm version
{ npm: '6.13.4',       
  ares: '1.10.1-DEV',  
  cldr: '32.0',        
  http_parser: '2.8.0',
  icu: '60.1',
  modules: '57',       
  napi: '4',
  nghttp2: '1.39.2',   
  node: '8.17.0',      
  openssl: '1.0.2s',   
  tz: '2017c',
  unicode: '10.0',     
  uv: '1.23.2',        
  v8: '6.2.414.78',    
  zlib: '1.2.11' }  




https://github.com/ethereum/EIPs/issues/190
https://trufflesuite.com/docs/truffle/


PS C:\GitWorkspace\react-dapp> truffle migrate --network develop
truffle(develop)> exec ./send.js

PS C:\GitWorkspace\react-dapp\client> npm run link-contracts
PS C:\GitWorkspace\react-dapp\client> npm run start

---
Fallback 함수 : 이름 없는 함수, 파라미터, 리턴 값을 가질수 없다. 컨트랙트에 하나만 존재할수 있다.
function () public payable {} // 이더를 받는 함수,  하우스의 초기 운영 자금을 받으려면 필요
web3.eth.sendTransaction(
    {from:web3.eth.account[9]
    ,to: ""
    ,value:web3.toWei(30,"ether")}
    )
----
Determin optic system
알고리즘에 의해 항상 동일한 결과를 리턴하는 시스템

----
bytes32 random = keccak256(abi.encodePacked(blockhash(block.number-seed), blockhash(placeBlockNumber)));

uint reveal = uint(random) % MAX_CASE;

if ((2 ** reveal) & bet.mask != 0) {
    winningAmount= possibelWinningAmount;
}












------------------

PS C:\GitWorkspace\react-dapp\client> npm install react-bootstrap


https://getbootstrap.com/docs/3.3/getting-started/

----------------
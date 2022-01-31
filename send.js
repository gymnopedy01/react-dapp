module.exports = function(callback) {
    web3.eth.sendTransaction(
        {
            from:web3.eth.accounts[9]
            , to:"0x940A1EDB015bFFaf38E145A7EEB3470E218A1CE1"
            , value: web3.toWei(30,"ether")
        }
        , callback
    );
}
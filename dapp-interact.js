const { Web3 } = require('web3')
const StudentMessCard = require('./build/contracts/StudentMessCard.json');
const provider = new Web3.providers.WebsocketProvider(`wss://eth-sepolia.g.alchemy.com/v2/${process.env.PROJECT_ID}`)
const web3 = new Web3(provider)
const uint8arr = new Uint8Array( Buffer.from(process.env.PRIVATE_KEY, 'hex'))
const account = web3.eth.accounts.privateKeyToAccount(uint8arr)
web3.eth.accounts.wallet.add(account)
const contractPromise = ((async () => {
    const networkId = await web3.eth.net.getId()
    const deployedNetwork = StudentMessCard.networks[networkId]
    return new web3.eth.Contract(StudentMessCard.abi, deployedNetwork.address)
})())

const addMessCard = async (usn, hash) => {
    const contract = await contractPromise
    const encodedFunctionCall = contract.methods['addMessCard'](usn, hash).encodeABI()
    await contract.methods.addMessCard(usn, hash).call();
    const tx = {
        from: web3.eth.accounts.wallet.at(0).address,
        to: contract.options.address,
        gas: 1000000,
        gasPrice: web3.utils.toWei('2', 'gwei'),
        data: encodedFunctionCall,
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
    const transactionHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${transactionHash}`);
};

const getMessCardHash = async (usn) => {
    const contract = await contractPromise
    const hash = await contract.methods.getMessCardHash(usn).call();
    return hash
};

module.exports = {
    addMessCard,
    getMessCardHash,
}
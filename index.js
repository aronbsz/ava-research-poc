const avalanche = require("avalanche");

/* Defining global constants */
const myNetworkID = 12345; //default is 1, we want to override that for our local network
const aval = new avalanche.Avalanche("localhost", 9650, "http", myNetworkID);
//xchain for exchange (normal AVAX transfer)
const xchain = aval.XChain(); 
const xKeychain = xchain.keyChain();
//p-chain for staking
const pchain = aval.PChain()
const pKeychain = pchain.keyChain()

const bintools = avalanche.BinTools.getInstance()

//Pre-funded local address
const privKey = "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"

async function sendTx(senderAddress, receiverAddress, assetId, amount){
    console.log(`Sender balance before tx: ${JSON.stringify(await xchain.getBalance(senderAddress, assetId))}`)
    console.log(`Receiver balance before tx: ${JSON.stringify(await xchain.getBalance(receiverAddress, assetId))}`)
    console.log(`Attempting to send ${amount}${(await xchain.getAssetDescription(assetId)).symbol} from ${senderAddress} to ${receiverAddress}`)

    //Fetch utxos of sender
    const avmUTXOResponse = await xchain.getUTXOs(senderAddress)
    const utxoSet = avmUTXOResponse.utxos
    //Create transaction
    const unsignedTx = await xchain.buildBaseTx(
      utxoSet,
      amount,
      assetId,
      [receiverAddress],
      [senderAddress],
      [senderAddress]
    )
    //Sign and issue transaction
    const tx = unsignedTx.sign(xchain.keyChain())
    const txid = await xchain.issueTx(tx)
    console.log(`Success! TXID: ${txid}`)
    var status
    while(status != "Accepted"){ //Ofc no need for this in real-life setting, doing this for log consistency
        status = await xchain.getTxStatus(txid)
    }
    console.log(`Sender balance after tx: ${JSON.stringify(await xchain.getBalance(senderAddress, assetId))}`)
    console.log(`Receiver balance after tx: ${JSON.stringify(await xchain.getBalance(receiverAddress, assetId))}`)
}

async function addDelegator(){
    //Importing pre-funded address as delegator to p-chain
    const privKey = "PrivateKey-ewoqjP7PxY4yr3iLTpLisriqt94hdyDFNgchSxGGztUrTXtNN"
    pKeychain.importKey(privKey)
    const pAddressStrings = pchain.keyChain().getAddressStrings()
    const nodeID = "NodeID-P7oB2McjBGgW2NXXWVYjV8JEDFoW9xDE5"
    const startTime = avalanche.utils.UnixNow().add(new avalanche.BN(60 * 1))
    const endTime = startTime.add(new avalanche.BN(2630000))
    const stakeAmount = await pchain.getMinStake()
    const platformVMUTXOResponse = await pchain.getUTXOs(pAddressStrings)
    const utxoSet = platformVMUTXOResponse.utxos
    
    const unsignedTx = await pchain.buildAddDelegatorTx(
        utxoSet,
        pAddressStrings,
        pAddressStrings,
        pAddressStrings,
        nodeID,
        startTime,
        endTime,
        stakeAmount.minDelegatorStake,
        pAddressStrings
    )
    
    const tx = unsignedTx.sign(pKeychain)
    const txid = await pchain.issueTx(tx)

    console.log(`Successfully delegated ${stakeAmount.minDelegatorStake.toNumber()} AVAX to Node ${nodeID}. TXID: ${txid}`)
}

async function main(){
    //Import pre-funded address as sender
    xKeychain.importKey(privKey)
    //Create new address for receiver
    const receiverKey = xKeychain.makeKey(); 
    const xAddressStrings = xKeychain.getAddressStrings()
    //Send 100 of the asset (here AVAX) from the imported sender to the created receiver
    await sendTx(xAddressStrings[0], xAddressStrings[1], bintools.cb58Encode(await xchain.getAVAXAssetID()), new avalanche.BN(100))
    //Delegate using the pre-funded address on the P-Chain
    await addDelegator()
}
main()

# Avalanche Reasearch PoC
## Setup
Make sure golang is installed on your device, e.g.:
```
sudo apt-get install golang
```
and GOPATH env. variable is set to `$HOME/go` (or the OS equivalent).

Avash, a lightweight local client built upon Avlanche Go is needed for the local environment.
```
go get github.com/ava-labs/avash
cd $GOPATH/src/github.com/ava-labs/avash
go build
```
Run the pre-written Avash script to bootstrap a local Avalanche env.
```
cd $GOPATH/src/github.com/ava-labs/avash (if not already there)
./avash runscript ./scripts/five_node_staking.lua
```
With the local env. set up, running the PoC is straightforward.
```
npm install
node index.js
```
## Developing Avalanche
JSON RPC calls are used to communicate with the blockchain. While AvalancheJS does a good job in providing wrappers for these calls, the [actual documentation]([https://link](https://docs.avax.network/build/tools/avalanchejs)) is somewhat lacklustre. I found the [examples](https://github.com/ava-labs/avalanchejs/tree/master/examples) and the [tests](https://github.com/ava-labs/avalanchejs/tree/master/tests) in the github repository to be more concise, and further [documentation on the API](https://github.com/ava-labs/avalanche-docs/blob/master/build/tools/avalanchejs/api.md) can be seen in the github docs as well.

## Avalanche staking
### Note on development
Since avalanche is unique in having three separate chains: the X-Chain for the creation and exchange of assets, the P-Chain for subnets, validators and delegation, and the C-chain for EVM compatibility and smart contracts, staking is not quite as straightforward as with other protocols.

Since users (commonly) hold their assets on the X-Chain, and delegation can only be done on the P-Chain, cross-chain transfers are needed. The [documentation]([https://link](https://docs.avax.network/build/tutorials/platform/transfer-avax-between-x-chain-and-p-chain)) shows the whole flow of transferring assets from the X-Chain to the P-Chain. These calls have their repsective methods in AvalancheJS, as seen in the [keychain](https://github.com/ava-labs/avalanche-docs/blob/2c498d5b84997c76ce0bae8178200ee940a28911/build/tools/avalanchejs/classes/api_avm.avmapi.md#keychain) documentation.

### General constraints for delegation
- The minimum amount that a delegator must delegate is 25 AVAX
- The minimum amount of time one can stake funds for delegation is 2 weeks
- The maximum amount of time one can stake funds for delegation is 1 year
- The minimum delegation fee rate is 2%
- The minimum percentage of the time a validator must be correct and online in order to receive a reward is 60%. There is no slashing in Avalanche, if the node doesn't behave well, the whole delegated amount is returned, only without any rewards.

### General workflow
[Source](https://docs.avax.network/learn/platform-overview/staking)
1. An avalanche account with at least 25AVAX (+transaction fees) on the **P-Chain** is needed. If the user doesn't have sufficient funds there, but has enough on the X-Chain, a cross-chain transaction is needed as metioned in the *Note on development* subsection.
2. The parameters the user needs to specify in order to stake are the following:
   - The ID of the node they’re delegating to
   - When they want to start/stop delegating stake (must be while the validator is validating) (Note: this is important, since after the transaction, there is no way to remove the funds before the stop time, nor it is possible to cancel before the start time.)
   - How many (>25) AVAX you are staking
   - The address to send any rewards to (Note: the reward is received **after** delegating)


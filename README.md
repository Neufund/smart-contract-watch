# smart-contract-watch
[![Build Status](https://travis-ci.org/Neufund/smart-contract-watch.svg?branch=master)](https://travis-ci.org/Neufund/smart-contract-watch) [![codecov](https://codecov.io/gh/Neufund/smart-contract-watch/branch/master/graph/badge.svg)](https://codecov.io/gh/Neufund/smart-contract-watch)

A smart contract monitoring tool.It can monitor smart contract activity and interactions based on transactions and events. It can be used a local blockchain explorer that runs locally in your server or machine or an investigation tool that scrapes the blockchain in search for a investigation. This is done by scanning transactions in the blockchain via JSON RPC calls to a working Ethereum Node.

NOTE: You need to connect to a working Ethereum node in order for this tool to run.
## Modes

Currently the smart-contract-watch runs in two modes:

- **Default mode**: the tool scans the blockchain block by block, transaction by transaction and log by log for any activity related to the specified smart contracts. This is a slow processes and heavy on the node due to the high number of `eth_getTransactionByHash` and `eth_getTransactionReceipt` RPC requests. However, this approach gives the opportunity to add more features in the future like instrumenting the EVM or debugging transactions.

- **Quick mode**: the tool scans the blockchain and acquires all needed information for a whole block by only sending two RPC calls `eth_getBlockByHash`, `get_logs`. This proves to be more efficient and faster for direct transaction scanning.

## Input
The smart contract watch can take parameters either as a
  - Command line tool from terminal
  - Environmental variables `.env`
  - `.watch.yml` Config file
  
You can mix between any of modes together, take into account that input modes are ordered by priority. A CLI `-q` option for example will override the two other modes.
### CLI
As a CLI tool you can run
`yarn run` and then insert all needed parameters
#### Parameters:
`-a or --addresses` Address or array of addresses represented (Required) ex:

`-a 0xf2Fbb2939981594e25d93e6226231FcC1b01718e, 0xfbb1b73c4f0bda4f67dca266ce6ef42f520fbb98`

`-f or --from` `Blocknumber` Starting blocknumber `Default:0`.

`-t or --to` `Blocknumber` Ending blocknumber, If left blank the tool will continue scanning for new blocks endlessly `Default: -`.

`-q or --quick` Quick Mode: Activates quick mode mentioned above `default: false`.

`-s or --save-state` Save State mode: Saves the last successful scanned block in a file, Smart Contract Watch starts from this file block. In order to use this you must include a store directory
ex, `-s ./example-file-path` or `--save-state ./example-file-path`.

`-n or --node-url` Path to node URL (Required) ex `-n "http://localhost:8545"`

`-l or --log-level` Specifies the log level indicated for reporting, you can choose one of three levels `[Debug,Info,Error]`, `Default:info`

`-o or --output-type` Specifies output type, you can choose one of two options,
`[terminal, graylog]`

`-e or --access-token` Etherscan access token, used to access etherscan for ABI importing. 

`--loggly-token`      Loggly access token
`--loggly-subdomain`  Loggly subdomain
`--loggly-tag`        Loggly tag

### ENV Variables 
Environmental variables come second in priority, you can specify every parameter indicated as an ENV variable. Additionally you can mix between different settings if convenient for your application.In your `.env` you can specify parameters as

`ADDRESSES`

`FROM_BLOCK` 

`TO_BLOCK`

`QUICK_MODE` True / False

`SAVE_STATE`

`RPC_URL`

`LOG_LEVEL`

`OUTPUT_TYPE`

`ACCESS_TOKEN`

`LOGGLY_ACCESS_TOKEN`

`LOGGLY_SUB_DOMAIN`

`LOGGLY_TAG`


The inputs are very similar to when using CLI only `QUICK_MODE` is different in the sense that it can use true/false values

### Config file
Smart Contract watch supports configuration files. You must insert all your configurations in a `.watch.yml` file. You can mix between both CLI and config file by filling only some of the needed fields, take into account that CLI and ENC override config file.

`-addresses`

`-from`

`-to`

`-quick`

`-saveState`

`-nodeUrl`

`-logLevel`

`-outputType`

`-accessToken`

## Smart Contract ABI
In order for the tool to successfully decode transactions. ABIs for the smart contracts must be provided this is done automatically by sending requests via [Etherscan's Contracts api](https://etherscan.io/apis#contracts). 

In case you want to add a smart contract that is in a private chain or not available on etherscan. you can add the ABI manually to the contracts directory `./smart contract watch/dist/contracts/` as a json file. the name of the json file must be exactly the same address as the smart contract. 

ex:

`./smart contract watch/dist/contracts/0xf2Fbb2939981594e25d93e6226231FcC1b01718e.json`

The tool always checks the local `./contracts` directory for smart contracts before it issues a request to etherscan. 

## Output
Smart-contract-watch reports two different activities conducted by a smart contract
- Direct transactions conducted from or to the monitored smart contracts. This is done by scanning the `to`, `from` fields in all transactions and reporting them back.

- Log events generated by the monitored smart contract. This is helpful when scanning for internal transactions/activity not directly conducted by the monitored smart-contract.

Additionally Smart Contract Watch currently supports two output modes:
- **Terminal output**: All marked transactions are sent directly to the terminal screen.

  `[#address] function(param1,param2,...) log(event1,event2,......)`
- **Graylog output**: All transaction are sent to Graylog after   formatting the output into a JSON object. Communication with graylog is done through a Docker container.


## How to use
- Clone git repository using 
 `git clone https://github.com/Neufund/smart-contract-watch`
- run `yarn` to install dependencies
- run `yarn start -f BLOCKNUMBER -t BLOCKNUMBER -a ARRAY_OF_ADDRESSES -n "http://examplepath" -l "DEBUG LEVEL"`

example:

  `yarn start -f 4240705 -a 0x2c974b2d0ba1716e644c1fc59982a89ddd2ff724 -n "http://localhost:8545" -l "info" -q`

### Tests
`yarn test`

### Developement instructions
- `$ yarn install` - _Install all dependencies_
- `$ echo PK="PRIVATE_KEY" > .env` - _Add testing private key_
- `$ npx hardhat compile` - _Compile all contracts_
- `$ npx hardhat test` - _Run all tests_


- Migrations are inside `scripts/` folder.
- Tests are inside `test/` folder.


node 版本：v18.19.1

部署流程
1. `npx hardhat run --network local scripts/deployment/deploy_boba_token.js`
2. `npx hardhat run --network local scripts/deployment/deploy_c2n_token.js`
3. `npx hardhat run --network local scripts/deployment/deploy_airdrop_c2n.js` 
4. `npx hardhat run --network local scripts/deployment/deploy_mock_token.js`
5. `npx hardhat run --network local scripts/deployment/deploy_singletons.js`
6. 设置saleConfig
7. `npx hardhat run --network local scripts/deployment/deploy_sales.js`

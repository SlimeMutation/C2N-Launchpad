# 前端部署
1. push 前端代码到github
2. vercel注册账号进行import
3. Framework preset 选择 next.js
4. 选择根目录：c2n-fe
5. 点击deploy
> c2n-fe/src/config/farms.js  进行token的地址设置

# 合约部署
1. cd c2n-contracts
2. npm i 
3. 配置.env
4. 部署token(奖励token和质押token使用同一个）：npx hardhat run scripts/deployment/deploy_c2n_token.js --network sepolia 
演示token地址
   0x1AC6D55962844659f6290F0a62159318363135b0
5. 更新deploy_farm 参数 startTS，奖励发放开始时间戳
6. 部署farm合约：npx hardhat run scripts/deployment/deploy_farm.js --network sepolia

前端参数修改，重新build

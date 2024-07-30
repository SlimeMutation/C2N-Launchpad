## 使用 curl 命令
```shell

curl -X POST \
http://localhost:30001/boba/update \
-H 'Content-Type: application/json' \
-d '{ "id": 3, "saleAddress": "0xbE1f0717E4Bfd6b3cAE527a543FdbA049671902f", "saleToken": "0x8332c63860eBAf9eCb1e61fb1829C76D2B2A1cB7", "tokenPriceInPT": "200000000000", "totalTokens": 10000000000000000000000, "saleEndTime": "1715243720000", "tokensUnlockTime": "1715243720000", "registrationStart": "1715243720000", "registrationEnd": "1715243720000", "saleStartTime": "1715243720000" }'


```

## 修改json内容：

1. 增加 "id": 3,
2. 替换 tokenPriceInPT -->> tokenPriceInEth
3. 时间戳增加 000 

    saleEndTime + 000
    tokensUnlockTime + 000
    registrationStart + 000
    registrationEnd + 000
    saleStartTime + 000

```json

{
  "id": 3, // 指定id
  "saleAddress": "0x21eb499756E69d49D866d494e111881767897ad2", // saleContractAddress
  "saleToken": "0x8332c63860eBAf9eCb1e61fb1829C76D2B2A1cB7", // tokenAddress
  "saleOwner": "0x0f590970a45d0b4c2dcfcaFF453400eE9B91B317", // tokenAddress
  "tokenPriceInEth": "100000000000", // tokenPriceInPT
  "totalTokens": "10000000000000000000000", // amount
  "saleEndTime": 1715242388000, // saleEnd
  "tokensUnlockTime": 1715244469000, // tge
  "registrationStart": 1715240069000, // registrationTimeStarts
  "registrationEnd": 1715241068000, // registrationTimeEnds
  "saleStartTime": 1715241188000 // saleStart
}

```


## 目标格式：

使用 curl 命令:

```shell

curl -X POST \
http://localhost:30001/boba/update \
-H 'Content-Type: application/json' \
-d '{ "id": 3, "saleAddress": "0xbE1f0717E4Bfd6b3cAE527a543FdbA049671902f", "saleToken": "0x8332c63860eBAf9eCb1e61fb1829C76D2B2A1cB7", "tokenPriceInPT": "200000000000", "totalTokens": 10000000000000000000000, "saleEndTime": "1715243720000", "tokensUnlockTime": "1715243720000", "registrationStart": "1715243720000", "registrationEnd": "1715243720000", "saleStartTime": "1715243720000" }'

```

执行脚本:

```shell
sh generate_update_data.sh '{"saleAddress":"0x854D2A5697857E1c7d085ae3649bFC5d02F9a483","saleToken":"0x8332c63860eBAf9eCb1e61fb1829C76D2B2A1cB7","saleOwner":"0x0f590970a45d0b4c2dcfcaFF453400eE9B91B317","tokenPriceInEth":"100000000000","totalTokens":"10000000000000000000000","saleEndTime":1715244920,"tokensUnlockTime":1715244729,"registrationStart":1715243300,"registrationEnd":1715243600,"saleStartTime":1715243720}' serverIp:port
```

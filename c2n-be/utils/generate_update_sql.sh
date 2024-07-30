#!/bin/bash

# usage:
# sh generate_update_sql.sh 1 '{"saleAddress": "0x854D2A5697857E1c7d085ae3649bFC5d02F9a483", "saleToken": "0x8332c63860eBAf9eCb1e61fb1829C76D2B2A1cB7", "saleOwner": "0x0f590970a45d0b4c2dcfcaFF453400eE9B91B317", "tokenPriceInEth": "100000000000", "totalTokens": "10000000000000000000000", "saleEndTime": 1715244920, "tokensUnlockTime": 1715244729, "registrationStart": 1715243300, "registrationEnd": 1715243600, "saleStartTime": 1715243720 }'

# 生成：
# delete from product_contract where id = 1;
# INSERT INTO product_contract (`id`,`name`,`description`,`img`,`twitter_name`,`status`,`amount`, `sale_contract_address`, `token_address`,`payment_token`,`follower`,`tge`, `project_website`,`about_html`,`registration_time_starts`,`registration_time_ends`,`sale_start`,`sale_end`,`max_participation`, `token_price_in_PT`,`total_tokens_sold`,`amount_of_tokens_to_sell`,`total_raised`,`symbol`,`decimals`,`unlock_time`,`medias`, `number_of_registrants`,`vesting`,`tricker`,`token_name`,`roi`,`vesting_portions_unlock_time`,`vesting_percent_per_portion`, `create_time`,`update_time`,`type`,`card_link`,`tweet_id`,`chain_id`,`payment_token_decimals`,`current_price`) VALUES (1,'pcontract_1','pcontract_1 desc','/img/pc_1.jpg','david_1',0,'10000000000000000000000', '0x854D2A5697857E1c7d085ae3649bFC5d02F9a483', '0x8332c63860eBAf9eCb1e61fb1829C76D2B2A1cB7','200',0,'2024-05-09 16:52:09', 'http://404.com','http://404.com/about.html','2024-05-09 16:28:20','2024-05-09 16:33:20','2024-05-09 16:35:20','2024-05-09 16:55:20','10', '100000000000','1','30','111','MCK',18,'2024-05-09 16:52:09',null, 1,null,null,'DemoToken1','1',null,null, '2024-04-25T12:25:07','2024-05-06T12:27:31',0,'http://card_link_1.com','tweet_id_1',11155111,18,0);

# 进入 mysql 容器，连接 mysql 服务
# docker exec -it brewery-mysql  /bin/bash
# mysql -uroot -p123456 brewery
# 执行生成的sql语句


id=$1
json=$2


# Function to convert timestamp to human-readable date
convertDate() {
    local osType=$(uname -s)
    local timestamp=$1
    if [ "$osType" = "Darwin" ]; then
        date -r $timestamp +"%Y-%m-%d %H:%M:%S"
    else
        date -d @$timestamp +"%Y-%m-%d %H:%M:%S"
    fi
}


saleAddress=$(echo $json | jq -r '.saleAddress')
saleToken=$(echo $json | jq -r '.saleToken')
saleOwner=$(echo $json | jq -r '.saleOwner')
tokenPriceInEth=$(echo $json | jq -r '.tokenPriceInEth')
totalTokens=$(echo $json | jq -r '.totalTokens')
saleEndTime=$(echo $json | jq -r '.saleEndTime')
tokensUnlockTime=$(echo $json | jq -r '.tokensUnlockTime')
registrationStart=$(echo $json | jq -r '.registrationStart')
registrationEnd=$(echo $json | jq -r '.registrationEnd')
saleStartTime=$(echo $json | jq -r '.saleStartTime')

## Convert timestamps to human-readable dates
#saleEndTime=`date -d @$saleEndTime +"%Y-%m-%d %H:%M:%S"`
#tokensUnlockTime=`date -d @$tokensUnlockTime +"%Y-%m-%d %H:%M:%S"`
#registrationStart=`date -d @$registrationStart +"%Y-%m-%d %H:%M:%S"`
#registrationEnd=`date -d @$registrationEnd +"%Y-%m-%d %H:%M:%S"`
#saleStartTime=`date -d @$saleStartTime +"%Y-%m-%d %H:%M:%S"`


# Convert timestamps to human-readable dates using the convertDate function
saleEndTime=$(convertDate $saleEndTime)
tokensUnlockTime=$(convertDate $tokensUnlockTime)
registrationStart=$(convertDate $registrationStart)
registrationEnd=$(convertDate $registrationEnd)
saleStartTime=$(convertDate $saleStartTime)

# Construct the SQL statement
insert_sql="INSERT INTO product_contract
(\`id\`,\`name\`,\`description\`,\`img\`,\`twitter_name\`,\`status\`,\`amount\`,
 \`sale_contract_address\`,
 \`token_address\`,\`payment_token\`,\`follower\`,\`tge\`,
 \`project_website\`,\`about_html\`,\`registration_time_starts\`,\`registration_time_ends\`,\`sale_start\`,\`sale_end\`,\`max_participation\`,
 \`token_price_in_PT\`,\`total_tokens_sold\`,\`amount_of_tokens_to_sell\`,\`total_raised\`,\`symbol\`,\`decimals\`,\`unlock_time\`,\`medias\`,
 \`number_of_registrants\`,\`vesting\`,\`tricker\`,\`token_name\`,\`roi\`,\`vesting_portions_unlock_time\`,\`vesting_percent_per_portion\`,
 \`create_time\`,\`update_time\`,\`type\`,\`card_link\`,\`tweet_id\`,\`chain_id\`,\`payment_token_decimals\`,\`current_price\`)
VALUES
    ($id,'pcontract_$id','pcontract_$id desc','/img/pc_$id.jpg','david_$id',0,'10000000000000000000000',
     '$saleAddress',
     '$saleToken','200',0,'$tokensUnlockTime',
     'http://404.com','http://404.com/about.html','$registrationStart','$registrationEnd','$saleStartTime','$saleEndTime','10',
     '$tokenPriceInEth','1','30','111','MCK',18,'$tokensUnlockTime',null,
     1,null,null,'DemoToken1','1',null,null,
     '2024-04-25T12:25:07','2024-05-06T12:27:31',0,'http://card_link_$id.com','tweet_id_1',11155111,18,0);"

echo ""
echo ""
echo ""
echo "============="
echo "生成的SQL语句"
echo "============="
echo ""

echo "delete from product_contract where id = $id;"

echo $insert_sql

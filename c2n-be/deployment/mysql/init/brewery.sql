create table `product_contract`
(
    `id`                       int(8) unsigned primary key not null auto_increment comment 'id',
    `name`                     varchar(80)                 not null comment '项目名称',
    `description`              longtext                    default null comment '项目描述',
    `img`                      varchar(500)                default null comment '项目图标地址',
    `twitter_name`             varchar(40)                 default null,
    `status`                   int(4)                      not null default 0 comment '项目状态',
    `amount`                   varchar(40)                 default null comment '当前币种质押个数',
    `sale_contract_address`    varchar(42)                 default null comment 'sale合约地址',
    `token_address`            varchar(42)                 default null comment 'bre合约地址',
    `payment_token`            varchar(42)                 default null comment '支付地址',
    `follower`                 int(8)                      not null default 0 comment 'ins或推特的follow数',
    `tge`                      datetime                    default null comment 'tge、时间',
    `project_website`          varchar(500)                default null comment 'projectWebsite',
    `about_html`               varchar(500)                default null comment 'about_html',
    `registration_time_starts` datetime                    default null comment '开始时间',
    `registration_time_ends`   datetime                    default null comment '结束时间',
    `sale_start`               datetime                    default null comment 'sale开始时间',
    `sale_end`                 datetime                    default null comment 'sale结束时间',
    `max_participation`        varchar(40)                 default null comment '硬顶',
    `token_price_in_PT`        varchar(40)                 default null comment 'Token price',
    `total_tokens_sold`        varchar(40)                 default null comment '所有已卖的token个数',
    `amount_of_tokens_to_sell` varchar(60)                 default null comment '质押币种',
    `total_raised`             varchar(60)                 default null comment '质押币种单位',
    `symbol`                   varchar(60)                 default null comment '币种单位（缩写）',
    `decimals`                 int(8)                      default 8    comment '数位',
    `unlock_time`              datetime                    default null comment '解锁时间',
    `medias`                   varchar(200)                default null comment '媒体链接',
    `number_of_registrants`    int(8)                      default null comment '注册人数',
    `vesting`                  varchar(40)                 default null ,
    `tricker`                  varchar(40)                 default null ,
    `token_name`               varchar(20)                 default null comment 'token名',
    `roi`                      varchar(20)                 default null comment 'roi',
    `vesting_portions_unlock_time`  varchar(60)            default null,
    `vesting_percent_per_portion`   varchar(60)            default null,
    `create_time`              datetime                    not null default CURRENT_TIMESTAMP comment '创建时间',
    `update_time`              datetime                    not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP comment '更新时间',
    `type`                     int(8)                      default null comment '项目类型',
    `card_link`                varchar(200)                default null comment '主页卡片跳转链接',
    `tweet_id`                 varchar(40)                 default null comment '转推任务的推文ID',
    `chain_id`                 int(8)                      default 0 comment '链ChainID',
    `payment_token_decimals`   int(8)                      default 8,
    `current_price`            bigint(12)                  default 0
) engine = InnoDB
  default charset = utf8mb4;


delete from product_contract where id = 3;

INSERT INTO product_contract
(`id`,`name`,`description`,`img`,`twitter_name`,`status`,`amount`,
 `sale_contract_address`,
 `token_address`,`payment_token`,`follower`,`tge`,
 `project_website`,`about_html`,`registration_time_starts`,`registration_time_ends`,`sale_start`,`sale_end`,`max_participation`,
 `token_price_in_PT`,`total_tokens_sold`,`amount_of_tokens_to_sell`,`total_raised`,`symbol`,`decimals`,`unlock_time`,`medias`,
 `number_of_registrants`,`vesting`,`tricker`,`token_name`,`roi`,`vesting_portions_unlock_time`,`vesting_percent_per_portion`,
 `create_time`,`update_time`,`type`,`card_link`,`tweet_id`,`chain_id`,`payment_token_decimals`,`current_price`)
VALUES
    (3,'pcontract_3','pcontract_3 desc','/img/pc_3.jpg','david',0,'10000000000000000000000',
     '0x21eb499756E69d49D866d494e111881767897ad2',
     '0x0f590970a45d0b4c2dcfcaFF453400eE9B91B317','200',0,'2024-05-09 16:47:49',
     'http://404.com','http://404.com/about.html','2024-05-09 15:34:29','2024-05-09 15:51:08','2024-05-09 15:53:08','2024-05-09 16:13:08','10',
     '100000000000','1','30','111','MCK',18,'2024-12-17T00:17:42',null,
     1,null,null,'DemoToken1','1',null,null,
     '2024-04-25T12:25:07','2024-05-06T12:27:31',0,'http://card_link2.com','tweet_id_1',11155111,18,0);

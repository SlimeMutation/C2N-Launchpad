package com.bobabrewery.repo.common.model;

import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * <p>
 *
 * </p>
 *
 * @author yunmengmeng
 * @since 2022-01-13
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Project implements Serializable {


    /**
     * id
     */
    private Integer id;

    /**
     * 项目名称
     */
    private String name;

    /**
     * 项目描述
     */
    private String description;

    /**
     * 项目图标地址
     */
    private String img;

    private String twitterName;

    /**
     * 项目状态
     */
    private Integer status;

    /**
     * 当前币种质押个数
     */
    private String amount;

    /**
     * sale合约地址
     */
    private String saleContractAddress;

    /**
     * bre合约地址
     */
    private String tokenAddress;

    /**
     * ?地址
     */
    private String paymentToken;

    /**
     * ins或推特的follow数
     */
    private Integer follower;

    /**
     * tge、时间
     */
    private Date tge;

    /**
     * projectWebsite
     */
    private String projectWebsite;

    /**
     * about_html
     */
    private String aboutHtml;

    /**
     * registration 开始时间
     */
    private Date registrationTimeStarts;

    /**
     * registration 结束时间
     */
    private Date registrationTimeEnds;

    /**
     * sale开始时间
     */
    private Date saleStart;

    /**
     * sale结束时间
     */
    private Date saleEnd;

    /**
     * 硬顶
     */
    private String maxParticipation;

    /**
     * Token price
     */
    private String tokenPriceInPT;

    /**
     * 所有已卖的token个数
     */
    private String totalTokensSold;

    /**
     * 质押币种
     */
    private String amountOfTokensToSell;

    /**
     * 质押币种单位
     */
    private String totalRaised;

    /**
     * 币种单位（缩写）
     */
    private String symbol;

    /**
     * 数位
     */
    private Integer decimals;

    /**
     * 解锁时间
     */
    private Date unlockTime;

    /**
     * 媒体链接
     */
    private String medias;

    /**
     * 注册人数
     */
    private Integer numberOfRegistrants;

    private String vesting;

    private String tricker;

    /**
     * token名
     */
    private String tokenName;
    /**
     * roi
     */
    private String roi;

    private String vestingPortionsUnlockTime;

    private String vestingPercentPerPortion;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 项目类型
     */
    private Integer type;

    /**
     * 主页卡片跳转链接
     */
    private String cardLink;

    /**
     * 转推任务的推文ID
     */
    private String tweetId;

    /**
     * 链ChainID
     */
    private Integer chainId;

    private Integer paymentTokenDecimals;

    private BigDecimal currentPrice;


}

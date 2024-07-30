package com.bobabrewery.repo.common.model;

import lombok.Data;

import java.util.Date;

/**
 * @Author chenkj
 * @Date 2022/1/11 10:39 上午
 */
@Data
public class ProductPO {
    private Integer id;
    private String saleAddress;
    private String saleToken;
    private String saleOwner;
    private String tokenPriceInPT;
    private String paymentToken;
    private String totalTokens;
    private Date saleEndTime;
    private Date tokensUnlockTime;
    private Date registrationStart;
    private Date registrationEnd;
    private Date saleStartTime;
}

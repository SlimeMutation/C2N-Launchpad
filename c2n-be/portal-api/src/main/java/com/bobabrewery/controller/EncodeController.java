package com.bobabrewery.controller;

import com.bobabrewery.common.Result;
import com.bobabrewery.common.exceptin.CommonException;
import com.bobabrewery.enums.ReCode;
import com.bobabrewery.service.EncodeService;
import com.bobabrewery.util.CredentialsUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.web3j.utils.Numeric;

import javax.annotation.Resource;
import java.math.BigInteger;

/**
 * 对用户信息使用私钥加签
 */
@Slf4j
@RestController
@RequestMapping("/encode")
public class EncodeController {

    @Resource
    private EncodeService encodeService;

    @Resource
    private CredentialsUtils credentialsUtils;


    /**
     * sign_registration
     *
     * @param userAddress     用户钱包地址
     * @param contractAddress 合约地址
     * @return 返回签名信息
     */
    @PostMapping("/sign_registration")
    public Result<String> signRegistration(String userAddress, String contractAddress) {
        log.info("userAddress={},contractAddress={}", userAddress, contractAddress);
        if (StringUtils.isBlank(userAddress) || StringUtils.isBlank(contractAddress)) {
            throw new CommonException(ReCode.INVALID_PARAMETERS);
        }
        String contractAddr = Numeric.cleanHexPrefix(contractAddress);
        String userAddr = Numeric.cleanHexPrefix(userAddress);
        String concat = userAddr.concat(contractAddr).toLowerCase();
        String hex = Numeric.prependHexPrefix(concat);
        String sign = null;
        try {
            sign = encodeService.sign(hex);
        } catch (Exception e) {
            log.error(e.getMessage(),e);
        }
        return Result.ok(sign);
    }

    /**
     * sign_participation
     *
     * @param userAddress     用户钱包
     * @param amount          数量
     * @param contractAddress 合约地址
     * @return 返回签名信息
     */
    @PostMapping("/sign_participation")
    public Result<String> signParticipation(String userAddress, String amount, String contractAddress) {
        log.info("userAddress={},contractAddress={},amount={}", userAddress, contractAddress, amount);
        if (StringUtils.isBlank(userAddress) || StringUtils.isBlank(contractAddress) || StringUtils.isBlank(amount)) {
            throw new CommonException(ReCode.INVALID_PARAMETERS);
        }

        String userAddressHexString = Numeric.cleanHexPrefix(userAddress);
        String amountHexString = Numeric.toHexStringNoPrefixZeroPadded(new BigInteger(amount), 64);
        String contractAddressHesString = Numeric.cleanHexPrefix(contractAddress);
        String hexString = Numeric.prependHexPrefix((userAddressHexString.concat(amountHexString).concat(contractAddressHesString)).toLowerCase());
        log.info("hexString={},userAddressHexString={}", hexString, userAddressHexString);
        return Result.ok(encodeService.sign(hexString));
    }


}

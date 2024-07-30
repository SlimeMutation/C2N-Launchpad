package com.bobabrewery.service.impl;

import com.bobabrewery.service.EncodeService;
import com.bobabrewery.util.CredentialsUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import javax.annotation.Resource;

/**
 * @author PailieXiangLong
 */
@Slf4j
@Service
public class EncodeServiceImpl implements EncodeService {

    @Resource
    private CredentialsUtils credentialsUtils;

    @Override
    public String sign(String hexString) {
        log.info("hexString={}", hexString);
        return credentialsUtils.getSign(hexString);

    }
}

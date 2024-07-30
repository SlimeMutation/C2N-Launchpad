package com.bobabrewery.service;

/**
 * @author PailieXiangLong
 */
public interface EncodeService {


    /**
     * 加密hex字符串
     *
     * @param hexString
     * @return
     */
    String sign(String hexString);
}

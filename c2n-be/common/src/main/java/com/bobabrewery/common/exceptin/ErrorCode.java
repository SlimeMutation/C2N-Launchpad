package com.bobabrewery.common.exceptin;

/**
 * @author PailieXiangLong
 */
public interface ErrorCode {
    /**
     * 错误码
     *
     * @return
     */
    int getCode();

    /**
     * 错误信息
     *
     * @return
     */
    String getDesc();

    /**
     * 设置错误信息
     *
     * @param desc
     */
    void setDesc(String desc);
}

package com.bobabrewery.common.enums;


import com.bobabrewery.common.exceptin.ErrorCode;

/**
 * @author PailieXiangLong
 */
public enum ReCode implements ErrorCode {

    /**
     * 成功
     */
    SUCCESS(200, "Success"),

    /**
     * 没有权限
     */
    NO_PERMISSION(403, "No Permission"),
    /**
     * 服务异常
     */
    SERVER_ERROR(500, "Internal Server Error"),
    /**
     * 参数错误
     */
    INVALID_PARAMETERS(501, "Invalid Parameters"),
    /**
     * Token失效
     */
    INVALID_TOKEN(502, "Invalid Token"),
    TOKEN_EXPIRED(502, "The token has expired"),
    /**
     * 失败
     */
    FAILED(503, "Failed"),

    /**
     * 数据存在
     */
    DATA_DUPLICATION(505, "Data exists"),
    /**
     * 验证失败
     */
    VERIFICATION_FAILED(506, "Wrong account or password."),

    /**
     * 请求过于频繁
     */
    REQUEST_TOO_FREQUENT(509, "Requests are too frequent"),

    /**
     * Invalid Parameters
     */
    PRIVATE_KEY_EXIST(502, "exist"),

    PRIVATE_KEY_NOT_EXIST(503, "key not exist");

    private final int status;
    private String message;

    @Override
    public int getCode() {
        return status;
    }

    @Override
    public String getDesc() {
        return message;
    }

    @Override
    public void setDesc(String desc) {
        this.message = desc;
    }

    ReCode(int code, String desc) {
        this.status = code;
        this.message = desc;
    }


}

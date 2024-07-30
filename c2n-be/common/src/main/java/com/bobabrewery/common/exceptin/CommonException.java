package com.bobabrewery.common.exceptin;

/**
 * @author PailieXiangLong
 */
public class CommonException extends RuntimeException {

    private ErrorCode errorCode;

    public CommonException(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }

    public CommonException(ErrorCode errorCode, String message) {
        errorCode.setDesc(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

}

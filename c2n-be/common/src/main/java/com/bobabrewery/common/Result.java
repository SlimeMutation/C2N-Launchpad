package com.bobabrewery.common;

import com.bobabrewery.common.enums.ReCode;
import com.bobabrewery.common.exceptin.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

/**
 * @author PailieXiangLong
 */
@Data
@JsonInclude(value = JsonInclude.Include.NON_NULL)
public class Result<T> {
    /**
     * 返回Code
     */
    private Integer code;
    /**
     * 返回数据
     */
    private T data;
    /**
     * 返回消息
     */
    private String message;

    public Result() {
    }

    public Result(int code, T data, String message) {
        this.code = code;
        this.data = data;
        this.message = message;
    }

    public static <T> Result<T> ok() {
        return new Result<T>(ReCode.SUCCESS.getCode(), null, "success");
    }

    public static <T> Result<T> ok(T data) {
        return new Result<T>(ReCode.SUCCESS.getCode(), data, "success");
    }

    public static <T> Result<T> fail(String message) {
        return new Result<T>(ReCode.FAILED.getCode(), null, message);
    }

    public static <T> Result<T> fail(ErrorCode responseCode) {
        return new Result<T>(responseCode.getCode(), null, responseCode.getDesc());
    }

    public static <T> Result<T> fail(ErrorCode responseCode, String message) {
        return new Result<T>(responseCode.getCode(), null, message);
    }


}

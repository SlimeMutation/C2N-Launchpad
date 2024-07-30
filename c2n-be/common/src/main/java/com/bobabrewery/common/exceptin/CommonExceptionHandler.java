package com.bobabrewery.common.exceptin;

import com.bobabrewery.common.Result;
import com.bobabrewery.common.enums.ReCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * 通用全局异常处理
 *
 * @author PailieXiangLong
 */
@Slf4j
public class CommonExceptionHandler {

    /**
     * 运行时异常
     *
     * @param e
     * @return
     */
    @ExceptionHandler(RuntimeException.class)
    public Result<String> handler(RuntimeException e) {
        log.error("运行时异常", e);
        return Result.fail(ReCode.SERVER_ERROR, e.getMessage());
    }

    /**
     * 自定义异常
     *
     * @param e
     * @return
     */
    @ExceptionHandler(CommonException.class)
    public Result<String> hanlder(CommonException e) {
        log.error("通用异常：Code：{}，Message：{}", e.getErrorCode().getCode(), e.getErrorCode().getDesc());
        return Result.fail(e.getErrorCode());
    }

    /**
     * 参数异常
     *
     * @return
     */
    @ExceptionHandler(value = {MethodArgumentNotValidException.class, BindException.class})
    public Result<String> bindExceptionHandler(BindException exception) {
        BindingResult bindingResult = exception.getBindingResult();
        String message = null;
        if (bindingResult.hasErrors()) {
            FieldError fieldError = bindingResult.getFieldError();
            if (fieldError != null) {
                // 返回消息组装  格式  属性名 + 注解消息
                message = fieldError.getField() + fieldError.getDefaultMessage();
            }
        }
        return Result.fail(ReCode.INVALID_PARAMETERS, message);
    }

    /**
     * 参数异常
     *
     * @return
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public Result<String> requestBodyMissingExceptionHandler(HttpMessageNotReadableException exception) {
        log.error("参数异常:{}", exception.getMessage());
        return Result.fail(ReCode.INVALID_PARAMETERS);
    }


    /**
     * 数据库违反唯一键错误
     *
     * @return
     */
    @ExceptionHandler(DuplicateKeyException.class)
    public Result<String> duplicateKeyException(DuplicateKeyException e) {
        log.error("违反唯一键:{}", e.getMessage());
        return Result.fail(ReCode.DATA_DUPLICATION);
    }

}

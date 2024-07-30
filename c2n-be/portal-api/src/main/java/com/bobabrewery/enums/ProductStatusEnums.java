package com.bobabrewery.enums;

/**
 * @Author chenkj
 * @Date 2022/1/7 11:11 上午
 */
public enum ProductStatusEnums {

    START_SUCCESS(0),
    REGISTERING(1),
    READY_SALE(2),
    IN_SALE(3),
    SALE_END(4),
    PRODUCT_END(5);

    private Integer code;

    ProductStatusEnums(int code) {
        this.code = code;
    }

    public Integer getCode() {
        return code;
    }

    public static ProductStatusEnums getStatusEnum(Integer code) {
        for (ProductStatusEnums userTypeEnum : ProductStatusEnums.values()) {
            if (userTypeEnum.getCode().equals(code)) {
                return userTypeEnum;
            }
        }
        return null;
    }
}

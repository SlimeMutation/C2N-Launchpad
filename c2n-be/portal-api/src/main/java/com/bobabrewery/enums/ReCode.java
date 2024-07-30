package com.bobabrewery.enums;


import com.bobabrewery.common.exceptin.ErrorCode;

/**
 * @author orange
 */

public enum ReCode implements ErrorCode {

    /**
     * 用户不存在
     */
    NOT_EXIST_USER(100, "Incorrect Account Or Password"),

    SUCCESS(200, "Success"),
    DATA_NOT_FOUND(404, "Data not found!"),
    INTERNAL_SERVER_ERROR(500, "Internal Server Error"),
    INVALID_PARAMETERS(501, "Invalid Parameters"),
    INVALID_TOKEN(502, "Invalid Token"),
    FAILED(503, "Failed"),
    INVALID_CODE(504, "Invalid code"),
    USER_IS_EXIST(505, "the user already exists"),
    MAIL_IS_EXIST(506, "This email has been bound with wallet address"),
    TWITTER_EXIST(507, "The twitter already in used!"),
    MAIL_SEND_FAILD(508, "Email sending failure!"),
    REQUEST_TOO_FREQUENT(509, "Requests are too frequent"),
    PASSWD_NOT_ALLOWED(601, "passwd not allowed"),
    USER_HAS_REGISTERED(701, "user has registered"),
    USER_ALREADY_REGISTERED(702, "You have already registered for other projects, please wait for other projects to finish before registering the current project"),
    USER_DID_NOT_REGISTER(703, "user did not register"),
    BRIDGE_ORDER_CREATE_FAILED(704, "order create failed!"),
    NOT_SUPPORT_MAIL(705, "mail not support"),

    BUY_AMOUNT_LIMIT(7001, "Purchase quantity exceeds the limit!"),

    CREATE_MEDIEVAL_ORDER_FAILED(9001, "Failed to create order"),

    NOT_WHITE_LIST(9003, "Sorry, you have NOT been whitelisted."),

    PROJECT_NOT_SALE(9002, "The campaign has not started yet."),

    PROJECT_END_SALE(9004, "The campaign has ended."),

    SALE_NOT_ENOUGH(9005, "Not enough"),
    NOT_NFT_OWNER(9006, "Refund failed: no NFT held"),
    CLAM_END(9007, "HasEnded");

    private int code;
    private String desc;

    @Override
    public int getCode() {
        return code;
    }

    @Override
    public String getDesc() {
        return desc;
    }

    @Override
    public void setDesc(String desc) {
        this.desc = desc;
    }

    ReCode(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

}

package com.bobabrewery.common.util;

import cn.hutool.jwt.JWT;
import cn.hutool.jwt.JWTHeader;
import cn.hutool.jwt.JWTUtil;
import cn.hutool.jwt.signers.JWTSigner;
import cn.hutool.jwt.signers.JWTSignerUtil;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * @author PailieXiangLong
 */
public class JWTUtils {

    private static final byte[] KEY = "BoBa2022_Token_key_6otOmfoarp:".getBytes(StandardCharsets.UTF_8);

    public static final String ID = "id";
    public static final String NAME = "name";
    public static final String ROLE = "role";
    public static final String EXP = "exp";

    /**
     * Token过期时间
     */
    private static final long EXPIRE_TIME = 1000 * 60 * 60 * 24 * 5;


    /**
     * Token签名
     */
    private static final JWTSigner SIGNER = JWTSignerUtil.hs256(KEY);

    /**
     * 生成token
     *
     * @return
     */
    public static String generateToken(Integer userId, String userName, String context, Integer roleId) {
        Map<String, Object> map = new HashMap<String, Object>(4) {
            {
                put(ID, userId);
                put(NAME, userName);
                put(ROLE, roleId);
                put(EXP, System.currentTimeMillis() + EXPIRE_TIME);
            }
        };
        return JWTUtil.createToken(map, SIGNER);
    }

    /**
     * 验证token
     *
     * @param token
     * @return
     */
    public static boolean verify(String token) {
        return JWTUtil.verify(token, SIGNER);
    }


    /**
     * 检查token是否过期 true还没过期 false已经过期
     *
     * @param token
     * @return
     */
    public static boolean expired(String token) {
        JWT jwt = JWTUtil.parseToken(token);
        Long expireTime = (Long) jwt.getPayload(EXP);
        return expireTime != null && expireTime > System.currentTimeMillis();
    }

    /**
     * 获取token中的角色ID
     *
     * @param token
     * @return
     */
    public static Integer getRoleId(String token) {
        JWT jwt = JWTUtil.parseToken(token);
        return (Integer) jwt.getPayload(ROLE);
    }

    /**
     * 获取token中的用户ID
     *
     * @param token
     * @return
     */
    public static Integer getUserId(String token) {
        JWT jwt = JWTUtil.parseToken(token);
        return (Integer) jwt.getPayload(ID);
    }


    /**
     * 解析Token
     *
     * @param token
     * @param key
     * @return
     */
    public static Object parseToken(String token, String key) {
        JWT jwt = JWTUtil.parseToken(token);
        jwt.getHeader(JWTHeader.TYPE);
        return jwt.getPayload(key);
    }


}

package com.bobabrewery.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import javax.annotation.PostConstruct;

/**
 * @author PailieXiangLong
 */
@Component
public class CredentialsUtils {
    /**
     * 私钥
     */
    @Value("${owner.private.key}")
    public String privateKey;

    private Credentials credentials;

    @PostConstruct
    public void init() {
        credentials = Credentials.create(privateKey);
    }

    /**
     * 签名方法
     *
     * @param hexString
     * @return
     */
    public String getSign(String hexString) {
        byte[] messageHash = Hash.sha3(Numeric.hexStringToByteArray(hexString));
        byte[] ethereumMessageHash = Sign.getEthereumMessageHash(messageHash);
        Sign.SignatureData signatureData = Sign.signMessage(ethereumMessageHash, this.credentials.getEcKeyPair(), false);
        return Numeric.toHexStringNoPrefix(signatureData.getR()).concat(Numeric.toHexStringNoPrefix(signatureData.getS())).concat(Numeric.toHexStringNoPrefix(signatureData.getV()));
    }

    public Credentials getCredentials() {
        return credentials;
    }
}

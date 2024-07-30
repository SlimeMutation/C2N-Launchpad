package com.bobabrewery;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.web3j.utils.Convert;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;

/**
 * @author PailieXiangLong
 */
@Slf4j
@ExtendWith(SpringExtension.class)
public class MetaDerbyServiceTest {

    @Test
    public void test() {
        BigInteger staked = Convert.toWei("1000", Convert.Unit.ETHER).toBigInteger();
        String horsesId = "8055555";
        String walletAddress = "0x123123123123123";
        String byWalletAddress = "8055555";


        // 全部马总质押数量
        BigInteger totalStakeAll = BigInteger.ZERO;

        // 总量加入10U
        int count = 5;
        // 10U 价值的bre
        BigDecimal bre10U = BigDecimal.TEN.divide(new BigDecimal("0.002"), 0, RoundingMode.HALF_UP);
        // 全部使用10U的BRE
        BigDecimal totalBre10U = bre10U.multiply(new BigDecimal(count));
        // totalBre10UWei
        BigDecimal totalBre10UWei = Convert.toWei(totalBre10U, Convert.Unit.ETHER);

        log.info("全部使用10U的BRE:{}",Convert.fromWei(totalBre10UWei, Convert.Unit.ETHER));
        //  全部使用10U的BRE + 全部马总质押数量
        BigDecimal all = totalBre10UWei.add(new BigDecimal(totalStakeAll));
        // * 80%
        BigDecimal totalAll = all.multiply(new BigDecimal("8")).divide(BigDecimal.TEN);

        // 8055555马的总质押
        BigInteger someOne = BigInteger.ZERO;

        // 8055555马的 1个 10U
        int i = 1;
        BigDecimal horsesBre = Convert.toWei(bre10U.multiply(new BigDecimal(i)), Convert.Unit.ETHER);
        log.info("horsesBre:{}", Convert.fromWei(horsesBre, Convert.Unit.ETHER));

        // 是白名单+10U
        staked = staked.add(Convert.toWei(bre10U, Convert.Unit.ETHER).toBigInteger());

        BigDecimal add = horsesBre.add(new BigDecimal(someOne));

        if (add.compareTo(BigDecimal.ZERO) <= 0) {
            add = BigDecimal.ONE;
        }

        // log.info("用户当前马匹质押量(带10U) :{}, 当前马的总质押(带10U): {} [全部马匹的总额(带全部10U) * 80%]:{}", Convert.fromWei(staked, Convert.Unit.ETHER),add,totalAll);
        //[ 用户当前马匹质押量(带10U) / 当前马的总质押(带10U) ] * [全部马匹的总额(带全部10U) * 80%] = 预估赢得的额度
        BigDecimal estimate = new BigDecimal(staked).divide(add, 2, RoundingMode.HALF_UP).multiply(totalAll);

        log.info("estimate:{}",Convert.fromWei(estimate, Convert.Unit.ETHER));


        
    }

}

package com.bobabrewery;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * @author orange
 */
@SpringBootApplication
@MapperScan({"com.bobabrewery.repo.*.mapper"})
@EnableFeignClients
public class PortalApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(PortalApiApplication.class, args);
    }
}

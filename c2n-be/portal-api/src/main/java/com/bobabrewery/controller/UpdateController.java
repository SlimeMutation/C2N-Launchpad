package com.bobabrewery.controller;

import com.bobabrewery.common.Result;
import com.bobabrewery.repo.common.model.ProductPO;
import com.bobabrewery.service.IProjectService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

/**
 * 更新项目信息
 *
 * @Author chenkj
 * @Date 2022/1/11 10:36 上午
 */
@RestController
@RequestMapping("/update")
public class UpdateController {

    @Resource
    private IProjectService productContractService;

    @PostMapping
    public Result update(@RequestBody ProductPO params) {
        this.productContractService.updateByProduct(params);
        return Result.ok();
    }
}

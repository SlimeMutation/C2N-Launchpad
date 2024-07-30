package com.bobabrewery.controller;

import com.alibaba.fastjson.JSONArray;
import com.bobabrewery.common.Result;
import com.bobabrewery.common.exceptin.CommonException;
import com.bobabrewery.domain.resp.ProductContractVO;
import com.bobabrewery.enums.ReCode;
import com.bobabrewery.repo.common.model.Project;
import com.bobabrewery.service.IProjectService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

/**
 * 项目接口
 */
@RestController
@RequestMapping("/product")
public class ProductController {


    @Autowired
    private IProjectService productContractService;

    /**
     * 展示项目详细信息
     *
     * @param productId
     * @return
     */
    @GetMapping("/base_info")
    public Result baseInfo(Integer productId) {
        if (productId == null || productId < 1) {
            throw new CommonException(ReCode.INVALID_PARAMETERS);
        }
        Project product = this.productContractService.getById(productId);
        if (product == null) {
            throw new CommonException(ReCode.INVALID_PARAMETERS);
        }
        ProductContractVO productContractVO = generateData(product);
        return Result.ok(productContractVO);
    }

    private ProductContractVO generateData(Project product) {
        ProductContractVO productContractVO = new ProductContractVO();
        BeanUtils.copyProperties(product, productContractVO);
        productContractVO.setSaleStart(product.getSaleStart().getTime());
        productContractVO.setSaleEnd(product.getSaleEnd().getTime());
        productContractVO.setRegistrationTimeEnds(product.getRegistrationTimeEnds().getTime());
        productContractVO.setRegistrationTimeStarts(product.getRegistrationTimeStarts().getTime());
        productContractVO.setCreateTime(product.getCreateTime().getTime());
        productContractVO.setUpdateTime(product.getUpdateTime().getTime());
        productContractVO.setTge(product.getTge().getTime());
        productContractVO.setUnlockTime(product.getUnlockTime().getTime());
        productContractVO.setVestingPortionsUnlockTime(JSONArray.parseArray(product.getVestingPortionsUnlockTime(), Long.class));
        productContractVO.setVestingPercentPerPortion(JSONArray.parseArray(product.getVestingPercentPerPortion(), Long.class));
        return productContractVO;
    }

    /**
     * 查询全部项目列表
     *
     * @return
     */
    @GetMapping("/list")
    public Result list() {
        List<Project> list = this.productContractService.list();
        List<ProductContractVO> voList = new ArrayList<>();
        list.forEach(product -> {
            ProductContractVO productContractVO = generateData(product);
            voList.add(productContractVO);
        });
        return Result.ok(voList);
    }
}

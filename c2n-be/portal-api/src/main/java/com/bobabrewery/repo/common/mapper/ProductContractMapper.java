package com.bobabrewery.repo.common.mapper;

import com.bobabrewery.repo.common.model.ProductPO;
import com.bobabrewery.repo.common.model.Project;

import java.math.BigDecimal;
import java.util.List;

/**
 * <p>
 * Mapper 接口
 * </p>
 *
 * @author yunmengmeng
 * @since 2022-01-13
 */
public interface ProductContractMapper {
    Project getById(Integer id);

    String getSaleContractAddressById(Integer id);

    boolean updateById(Project entity);

    void updateByProduct(ProductPO params);

    List<Project> selectNotEndProduct();

    List<Project> list();

    void updateStatus(Integer status, Integer id);

    Integer getStatusById(Integer id);

    List<Project> selectRegister();

    int updateCurrentPriceByID(BigDecimal currentPrice, Integer id);

    List<Project> selectAllStopProject();
}

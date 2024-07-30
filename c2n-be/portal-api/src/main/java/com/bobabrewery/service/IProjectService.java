package com.bobabrewery.service;

import com.bobabrewery.repo.common.model.ProductPO;
import com.bobabrewery.repo.common.model.Project;

import java.util.List;

/**
 * <p>
 * 服务类
 * </p>
 *
 * @author yunmengmeng
 * @since 2022-01-13
 */
public interface IProjectService {
    Project getById(Integer id);

    boolean updateById(Project entity);

    List<Project> list();

    void updateByProduct(ProductPO params);

    List<Project> selectNotEndProduct();

    void updateStatus(Integer status, Integer id);
}

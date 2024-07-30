package com.bobabrewery.common;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * @author PailieXiangLong
 */
@Data
public class PageParam {
    /**
     * 当前页索引 must大于0
     *
     * @mock 1
     */
    @NotNull
    private Integer pageIndex;
    /**
     * 当前页面大小
     *
     * @mock 10
     */
    @NotNull
    private Integer pageSize;
    /**
     * 计算得出的数据库开始索引
     *
     * @ignore
     */
    private Integer startIndex;


    public PageParam() {
    }

    public void setPageIndex(Integer pageIndex) {
        this.pageIndex = pageIndex > 0 ? pageIndex : 1;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize > 0 ? pageSize : 10;
    }

    public Integer getStartIndex() {
        return (pageIndex - 1) * pageSize;
    }
}

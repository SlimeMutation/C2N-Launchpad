package com.bobabrewery.common.util;

import com.bobabrewery.common.PageParam;
import com.bobabrewery.common.enums.ReCode;
import com.bobabrewery.common.exceptin.CommonException;
import lombok.Data;

import java.util.List;

/**
 * @author PailieXiangLong
 */
@Data
public class Page<T> {
    /**
     * 当前页码
     */
    private Integer pageIndex;
    /**
     * 每页大小
     */
    private Integer pageSize;
    /**
     * 总页数
     */
    private Integer pageCount;

    /**
     * 总数据量
     */
    private Long dataCount;

    /**
     * 数据
     */
    private List<T> data;

    public Page() {
    }

    public Page(PageParam pageParam, Long dataCount, List<T> data) {
        this.pageIndex = pageParam.getPageIndex();
        this.pageSize = pageParam.getPageSize();
        this.dataCount = dataCount;
        this.pageCount = Math.toIntExact((dataCount % pageSize) > 0 ? (dataCount / pageSize) + 1 : dataCount / pageSize);
        this.data = data;
        if (pageCount > 0) {
            if (pageIndex > pageCount) {
                throw new CommonException(ReCode.INVALID_PARAMETERS);
            }
        }

    }

}

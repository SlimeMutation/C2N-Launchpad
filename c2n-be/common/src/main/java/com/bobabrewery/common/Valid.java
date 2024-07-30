package com.bobabrewery.common;

import javax.validation.groups.Default;

/**
 * @author PailieXiangLong
 */
public interface Valid extends Default {
    interface Group extends Valid {
        interface Create extends Group {
        }

        interface Update extends Group {

        }

        interface Query extends Group {

        }

        interface Delete extends Group {

        }
    }
}

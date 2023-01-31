export enum Error {
    /** 积分不足 */
    POINTS_NOT_ENOUGH = 'ERR_POINTS_NOT_ENOUGH',

    /** 取消订单超过允许取消的最大时间 */
    CANCEL_ORDER_TIMEOUT = 'ERR_CANCEL_ORDER_TIMEOUT',

    /** 禁止重复喜欢 */
    DISALLOW_DUPLICATE_LIKE = 'ERR_DISALLOW_DUPLICATE_LIKE',

    /** 禁止给同一只猫咪打上重复标签 */
    DISALLOW_DUPLICATE_TAG = 'ERR_DISALLOW_DUPLICATE_TAG',
}

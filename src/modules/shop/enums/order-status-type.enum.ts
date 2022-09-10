export enum OrderStatusType {
    /** 备货中 */
    STOCKING = '0',

    /** 待取货 */
    PENDING_RECEIPT = '1',

    /** 交易成功 */
    SUCCESS = '2',

    /** 交易取消 */
    CANCEL = '3',
}

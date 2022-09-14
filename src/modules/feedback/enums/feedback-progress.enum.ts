export enum FeedbackProgress {
    /** 待处理 */
    PENDING = '0',

    /** 已确认,正在处理 */
    PROGRESSING = '1',

    /** 无需处理 */
    NO_NEED = '2',

    /** 处理完成 */
    FINISHED = '3',

    /** 无法确认 */
    UNCONFIRMABLE = '4',

    /** 重复反馈 */
    DUPLICATE = '5',
}

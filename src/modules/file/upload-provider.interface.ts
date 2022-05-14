import { FileType } from './enums/file-type.enum';

export interface UploadPrividerInterface {
    /**
     * 获取上传接口参数
     * @param userID 用户ID
     * @param fileType 文件类型
     * @param extName 扩展名
     * @returns 接口参数,直接返回给客户端
     */
    getUploadParams(
        userID: number,
        fileType: FileType,
        extName: string,
    ): Promise<{
        url: string;
        params: object;
    }>;
}

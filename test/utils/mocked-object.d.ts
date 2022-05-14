/* Mock对象,一般用于构建mock instance传入依赖 */
export type MockedObject = { [key: string]: jest.Mock<any, any> };
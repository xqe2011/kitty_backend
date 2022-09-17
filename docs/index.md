# 概述
欢迎使用Kitty小程序后端接口,本系统接口遵守RESTFul规范,您可以通过判断HTTP状态码来判断请求是否成功.  
本系统分为3个部分,一个是您现在看到的后端接口,一个是推荐算法模块,一个是随手拍识别模块.对于前端开发者,您无需考虑其他两个模块,模块间的协调将由后端完成.  
# 配置
下列所有的配置均可通过环境变量引入或者覆盖,您也可以通过修改.env文件来修改配置,默认值为无的配置是必填配置,请保证所有配置按照要求填写,否则系统可能出现运行异常.

## 数据库
| 配置项                        | 默认值 | 描述     |
| ----                         | ----  | ----    |
| database.host                | 无    | 主机地址  |
| database.username            | 无    | 用户名   |
| database.password            | 无    | 密码     |
| database.port                | 3306  | 端口     |
| database.name                | 无    | 数据库名称|

## 文件存储
本系统支持多种存储用户上传文件的方式,您可以用统一的接口快速增加存储源的支持,目前系统集成有两种方式.
- 七牛云对象存储, 别名`qiniu`,需要您提前申请好七牛的appid和域名等
- 本地存储,别名`local`,需要您将一个专用的静态资源域名指向服务器并设置好nginx使该域名可以访问`files.providers.local.path`

| 配置项                       | 默认值 | 描述                                                                     |
| ----                        | ----  | ----                                                                    |
| files.upload.provider       | local | 使用的文件上传提供者,可以为`local`或`qiniu`                                  |
| files.token_expired_time    | 60    | 文件上传成功后服务器返回的上传成功凭证有效期,用于需要文件的接口调用时判断文件状态用   |
| files.url                   | 无    | 文件访问的网址                                                             |

### 七牛存储
| 配置项                                             | 默认值                     | 描述                             |
| ----                                              | ----                      | ----                            |
| files.providers.qiniu.scope                       | 无                        | 七牛Scope                        |
| files.providers.qiniu.upload.token_expired_time   | 1200                      | 服务器生成的七牛上传Token有效期      |
| files.providers.qiniu.upload.url                  | 无                        | 七牛上传地址,参考七牛官网直传部分的URL|
| files.providers.qiniu.upload.max_size             | 52428800                  | 允许上传的最大文件大小              |
| files.providers.qiniu.access_key                  | 无                        | 七牛AccessKey                     |
| files.providers.qiniu.secret_key                  | 无                        | 七牛SecretKey                     |
### 本地存储
| 配置项                                             | 默认值                     | 描述                                            |
| ----                                              | ----                      | ----                                           |
| files.providers.local.upload.tmp_path             | ../tmp                    | 本地上传文件临时存储路径                           |
| files.providers.local.upload.token_expired_time   | 1200                      | 服务器生成的本地上传Token有效期                    |
| files.providers.local.path                        | 无                         | 文件通过验证后的持久存储路径,请暴露在公网上供客户端访问 |
| files.providers.qiniu.upload.max_size             | 52428800                  | 允许上传的最大文件大小                             |

## 微信
| 配置项                        | 默认值                     | 描述                                 |
| ----                         | ----                      | ----                                 |
| wechat.url                   | https://api.weixin.qq.com | 微信API服务地址                        |
| wechat.miniprogram.appid     | 无                        | 小程序APPID                           |
| wechat.miniprogram.appsecret | 无                        | 小程序APPSECRET                       |
| wechat.renew_in              | 30                        | 微信AccessToken续期将在过期前多久进行    |
| wechat.retry_duration        | 30                        | 微信AccessToken续期失败后每多少秒重试    |

## 通用
| 配置项              | 默认值                     | 描述                                       |
| ----               | ----                      | ----                                      |
| secret             | 无                        | 服务器安全密钥,对于同一集群需要相同,请保证密钥安全 |
| debug              | false                     | 是否开启调试模式                             |
| api.url            | 无                        | 本后端服务的网址,需包含`https://`或`http://`   |
| jwt.expires_in     | 600s                      | JWT令牌过期时间                              |

# 认证
本系统除了登陆及文件上传等接口外(具体可参考各API的AUTHORIZATIONS字段)都需要通过HTTP Header进行认证,每次请求时需要携带认证头,认证方式如下:
# 业务错误代码列表
| 错误代码                           | 描述                                       |
| ----                              | ----                                      |
| ERR_POINTS_NOT_ENOUGH             | 积分不足                                   |
| ERR_CANCEL_ORDER_TIMEOUT          | 订单已超过允许取消的时间或者订单处于无法取消状态  |
| ERR_DISALLOW_DUPLICATE_LIKE       | 该点赞实体不允许同一个用户重复点赞              |
<SecurityDefinitions />
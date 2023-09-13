# x-tunnel-ssh

使用SSH打开远程服务器通道。用于在本地访问那些限定了IP访问的数据库。类似VPN。

``` sh
x-tunnel-ssh
-H, --help <boolean>  显示帮助 默认值：false
--ssh <string>        ssh 主机
--user <string>       ssh 登录账号
--key <string>        ssh 登录账号密钥
--remote <string>     目标主机
--remotePort <int>    目标端口
--localPort <int>     本地连接端口 默认值：7000
--id <string>          默认值：""
```

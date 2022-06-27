import Tunnel from 'tunnel-ssh';
import { createServer, Server } from 'net';

export interface IConfig {
    SshConfig: ISshConfig,
    remotePort: number, // 目标服务器端口
    remoteHost: string, // 目标服务器地址
    localPort: number//本地端口
}
export interface ISshConfig {
    host: string;
    port: number,
    username: string;
    password?: string;
    /**
     * require('fs').readFileSync('<pathToKeyFile>'),
     */
    privateKey?: Buffer | string;
    /**
     * option see ssh2 config
     */
    passphrase?: string;
}
export function testPort(port: number) {
    return new Promise((resolve, reject) => {
        // 创建服务并监听该端口
        // console.log('测试端口：', port);
        var server = createServer().listen(port, '127.0.0.1')
        server.on('listening', function () { // 执行这块代码说明端口未被占用
            // console.log(port, 'ok')
            server.close() // 关闭服务
            resolve(true);
        })

        server.on('error', function (err) {
            // console.log(err);
            if (err.stack === 'EADDRINUSE') { // 端口已经被使用
                //console.log('The port【' + port + '】 is occupied, please change other port.')
                console.log(err);
            }
            resolve(false);
        });
    });
}
export const openTunnel = (config: IConfig) => {
    var newStyleConfig = {
        username: config.SshConfig.username,
        port: config.SshConfig.port,
        host: config.SshConfig.host,
        // SSH2 Forwarding... 
        dstPort: config.remotePort, // 目标服务器端口
        dstHost: config.remoteHost, // 目标服务器地址
        //srcPort: config.localPort,
        //srcHost: '127.0.0.1',
        // Local server or something...
        localPort: config.localPort,
        localHost: '127.0.0.1',
        privateKey: config.SshConfig.privateKey,
        keepAlive: true,
        readyTimeout:99999,
    }
    return new Promise<Server>((resolve, reject) => {
        const tunnel = Tunnel(newStyleConfig, (err) => {
            // console.log('Tunnel connected', err);
            if (err) {
                reject(err)
                return;
            }
            tunnel.addListener('connection', ()=> {console.log('ssh connection');});
            tunnel.addListener('listening', ()=> {console.log('ssh listening');});
            tunnel.addListener('close', ()=> {console.log('ssh close');});
            tunnel.addListener('error', (err)=> {console.log('ssh err', err);});
            resolve(tunnel);
        });
    });
}
export default openTunnel;

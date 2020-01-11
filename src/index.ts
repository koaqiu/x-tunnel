import openTunnel, { testPort } from './tunnel';
import Commander from 'x-command-parser';
import readline from 'readline'
import FS from 'fs';
import PATH from 'path';
import net from 'net';
function readLine(question: string) {
    return new Promise<string>((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(question, (answer) => {
            resolve(answer);
            rl.close();
        });
    });
}
function telToClose(port:number){
    const address = process.platform=='win32' 
                        ? PATH.join('\\\\?\\pipe', process.cwd(), `x-tunnel_${port}.sock`)
                        : `/tmp/x-tunnel_${port}.sock`;
    var stream = net.connect(address);
    stream.on('error',(error)=>{
        console.log('client', error)
    });
    stream.write('close');
    stream.end();
}
function createNamePipeServer(port:number) {
    return new Promise<net.Server>((resolve, reject)=>{
        const server = net.createServer(function (stream) {
            stream.on('data', function (c) {
                //console.log('data:', c.toString());
                process.exit(0);
            });
            stream.on('error',(err)=>{
                console.log('NAMEPPE STREAM ERROR', err)
            })
            stream.on('end', function () {
                server.close();
            });
        });
        server.on('error',(err)=>{
            //console.log('NAMEPPE ERROR', err.name, err.message)
            if(err.message.includes('address already in use')){
                telToClose(port);
            }else{
                reject(err);
            }
        });
        const address = process.platform=='win32' 
                        ? PATH.join('\\\\?\\pipe', process.cwd(), `x-tunnel_${port}.sock`)
                        : `/tmp/x-tunnel_${port}.sock`;
        server.listen(address,()=>{
            resolve(server);
        });
    });
}
const commands = ['exit'];
async function main() {
    const cmds = new Commander(true)
        .addParam({
            name: 'ssh',
            type: 'string',
            comment: 'ssh 主机',
        })
        .addParam({
            name: 'user',
            type: 'string',
            comment: 'ssh 登录账号',
        })
        .addParam({
            name: 'key',
            type: 'string',
            comment: 'ssh 登录账号密钥',
        })
        .addParam({
            name: 'remote',
            type: 'string',
            comment: '目标主机',
        })
        .addParam({
            name: 'remotePort',
            type: 'int',
            comment: '目标端口'
        })
        .addParam({
            name: 'localPort',
            type: 'int',
            comment: '本地连接端口',
            default: 7000
        })
        .addParam({
            name:'id',
            type:'string',
            default:''
        })
        .parse();
    let keyFile = cmds.Options['key'];
    if (!PATH.isAbsolute(keyFile)) {
        console.log(process.cwd());
        keyFile = PATH.join(process.cwd(), keyFile);
    }
    if (!FS.existsSync(keyFile)) {
        console.log(`SSH密钥文件：${keyFile}不可用，请更换以后重试`);
        return 1;
    }
    const localPort = <number>cmds.Options['localPort']
    if (!await testPort(localPort)) {
        console.log(`端口：${localPort}不可用，请更换以后重试`);
        return 1;
    }
    let cmd = '';
    const namePipe = await createNamePipeServer(localPort).catch(err=>{
        console.log('xxxxxxxxxxxxxxxxxx');
        return null;
    });
    if(namePipe == null || namePipe == undefined){ 
        return;
    }
    while (cmd != 'exit') {
        try {
            const tunnel = await openTunnel({
                remoteHost: cmds.Options['remote'],
                remotePort: <number>cmds.Options['remotePort'],
                localPort: localPort,
                SshConfig: {
                    host: cmds.Options['ssh'],
                    username: cmds.Options['user'],
                    port: 22,
                    privateKey: FS.readFileSync(cmds.Options['key']).toString(),
                }
            });
            //console.log(cmds.Options['ssh'], cmds.Options['user'], cmds.Options['key'])
            //console.log(FS.readFileSync(cmds.Options['key']).toString());
            cmd = await readLine(`隧道已经打开：local:${localPort} => ${cmds.Options['remote']}:${cmds.Options['remotePort']}\n`);
            while (!commands.includes(cmd)) {
                cmd = await readLine(`输入错误：`);
            }
            tunnel.close();
        } catch (err) {
            console.log('发生错误：', err);
            cmd = '';
        }
    }
    namePipe.close();
    return 0;
}

main()
    .then(code => {
        // console.log(code);
    })
    .catch(err => {
        console.error(err);
    });
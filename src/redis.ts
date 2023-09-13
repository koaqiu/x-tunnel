import openTunnel, { testPort } from './tunnel';
import FS from 'fs';
import PATH from 'path';
import { loadSettingsAsync, checkFile } from './settings';
import { createNamePipeServer, readLine } from './lib';

const commands = ['exit'];
async function main() {
    const [keyFileExists, keyFile] = checkFile(await loadSettingsAsync().then(x => x?.sshKey) ?? '');
    if (!keyFileExists) {
        console.log(`SSH密钥文件：${keyFile}不可用，请更换以后重试`);
        return 1;
    }
    const localPort = 6379
    if (!await testPort(localPort)) {
        console.log(`端口：${localPort}不可用，请更换以后重试`);
        return 1;
    }
    let cmd = '';
    const namePipe = await createNamePipeServer(localPort).catch(err=>{
        console.log('xxxxxxxxxxxxxxxxxx', err);
        return null;
    });
    if(namePipe == null || namePipe == undefined){ 
        return;
    }
    const config = {
        remoteHost: 'r-wz942201d75156c4.redis.rds.aliyuncs.com',
        remotePort: 6379,
        localPort: localPort,
        SshConfig: {
            host: '120.76.131.15',
            username: 'root',
            port: 22,
            privateKey: FS.readFileSync(keyFile).toString(),
        }
    };     
    while (cmd != 'exit') {
        try {       
            const tunnel = await openTunnel(config);
            cmd = await readLine(`隧道已经打开：local:${localPort} => ${config.remoteHost}:${config.remotePort}\n`);
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
    .catch(err => {
        console.error(err);
    });
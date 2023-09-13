import openTunnel, { testPort } from './tunnel';
import FS from 'fs';
import PATH from 'path';
import { checkFile, loadSettingsAsync } from './settings';
import { createNamePipeServer, readLine } from './lib';

const commands = ['exit'];
async function main() {
    const [keyFileExists, keyFile] = checkFile(await loadSettingsAsync().then(x => x?.sshKey) ?? '');
    if (!keyFileExists) {
        console.log(`SSH密钥文件：${keyFile}不可用，请更换以后重试`);
        return 1;
    }
    const localPort = 3306
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
    const config = {
        remoteHost: 'rm-wz97mb4ar75v27x35.mysql.rds.aliyuncs.com',
        remotePort: 3306,
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
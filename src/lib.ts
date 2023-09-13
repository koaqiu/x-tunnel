import readline from 'readline'
import FS from 'fs';
import PATH from 'path';
import net from 'net';

export function readLine(question: string) {
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
export function createNamePipeServer(port:number) {
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
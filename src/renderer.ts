// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import * as Q from 'q';
import {ReadLogFileContent, RPCService, services} from './RPCServices'

let readFileLogContent: RPCService<string> = services[ReadLogFileContent.Method];

async function run(): Promise<void> {

    let result = await readFileLogContent.call('');

    console.log(result);
}

Q(run()).done();
import * as _ from 'lodash';
import {ipcMain} from 'electron';


import {services, RPCService} from './RPCServices'

export let logFilePath: string;

export function initialize(logFile: string) {
    logFilePath = logFile;

    _.each(services, (value, key) => {
        let rpcService = value as RPCService<any>;

        ipcMain.on(rpcService.method, async (event, data) => {
            let result = await rpcService.servicing(event, data);
            event.sender.send(`{this.method}-reply`, result);
        });
    });
}

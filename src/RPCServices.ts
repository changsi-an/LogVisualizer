import * as fs from 'fs';

import {ipcRenderer} from 'electron';
import {logFilePath} from './mainThreadServices';


export interface RPCService<T> {
    method: string;

    servicing(event, arg): Promise<T>;

    call(data: any): Promise<T>;
}

export abstract class ServiceBase<T> implements RPCService<T> {
    abstract servicing(event: any, arg: any): Promise<T>;
    abstract method: string;

    call(data: any): Promise<T> {
        return new Promise<T>((resolve, reject)=> {
            ipcRenderer.once(`{this.method}-reply`, (event, result: T) => {
                resolve(result);
            });
            ipcRenderer.send(this.method, data);
            setTimeout(()=> {
                reject('timeout')
            }, 5000);
        });
    }
}

export class ReadLogFileContent extends ServiceBase<string> implements RPCService<string>{
    static Method: string;
    method: string = "getLogFileContent";

    constructor() {
        super();
        ReadLogFileContent.Method = this.method;
    }

    servicing(event: any, arg: any): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(logFilePath, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data.toString());
            });
        });
    }
}

let readLogFileContent = new ReadLogFileContent();

export let services  : {
    [methodName: string]: RPCService<any>
} = {};

services[readLogFileContent.method] = readLogFileContent;


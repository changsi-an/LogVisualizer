import * as Q from 'q';
import * as readline from 'readline';
import * as stream from 'stream';
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ReadLogFileContent, RPCService, services} from './RPCServices'

let readFileLogContent: RPCService<string> = services[ReadLogFileContent.Method];
let fileContent: string;

async function run(): Promise<void> {

    let result = await readFileLogContent.call('');

    console.log(result);

    fileContent = result;

    ReactDOM.render(
            <List />,
            document.getElementById("app")
    );
}

class LogData {
    private _rawdata: string;
    private _lines: string[];

    constructor(input: string) {
        this._rawdata = input;
        this._lines = undefined;
    }

    public async preloadAllData(): Promise<void> {
        for await (const _l of this.readLine()) {
        }
    }

    public async *readLine(): AsyncIterableIterator<string> {
        if (!this._lines) {
            await this.unpackRawDataToLines();
        }

        yield* this._lines;
    }

    get LineCount(): number {
        return this._lines && this._lines.length || 0;
    }

    private async unpackRawDataToLines(): Promise<void> {
        this._lines = [];
        let s = new stream.Readable();
        s.push(this._rawdata);
        s.push(null);

        const rl = readline.createInterface(s);

        rl.on('line', (line) => {
            this._lines.push(line);
        });

        return new Promise<void>((resolve) => {
            rl.once('close', resolve);
        });
    }
}

class List extends React.Component<{}, {
    record: number
}> {

    private _logData: LogData;

    constructor(props) {
        super(props);

        this.state = {
            record: 0
        };
    }

    render() {
        return <h1>Hi! {this.state.record}</h1>;
    }

    async componentDidMount() {
        this._logData = new LogData(fileContent);

        await this._logData.preloadAllData();

        this.setState({
            record: this._logData.LineCount
        })
    }
}

Q(run()).done();
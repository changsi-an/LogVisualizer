import * as Q from 'q';
import * as readline from 'readline';
import * as stream from 'stream';
import * as React from "react";
import * as ReactDOM from "react-dom";
import {ReadLogFileContent, RPCService, services} from './RPCServices'
import {createListItem} from './components';

let readFileLogContent: RPCService<string> = services[ReadLogFileContent.Method];
let fileContent: string;

async function run(): Promise<void> {

    fileContent = await readFileLogContent.call('');

    ReactDOM.render(
            <List />,
            document.getElementById("app")
    );
}

export interface LineData {
    sequence: number;
    text: string;
}

class LogData {
    private _rawData: string;
    private _lines: string[];

    constructor(input: string) {
        this._rawData = input;
        this._lines = undefined;
    }

    public async preloadAllData(): Promise<void> {
        for await (const _l of this.readLine()) {
        }
    }

    public async *readLine(): AsyncIterableIterator<LineData> {
        if (!this._lines) {
            await this.unpackRawDataToLines();
        }

        let id = 1;
        for (const line of this._lines) {
            yield {
                sequence: id++,
                text: line
            }
        }
    }

    get LineCount(): number {
        return this._lines && this._lines.length || 0;
    }

    private async unpackRawDataToLines(): Promise<void> {
        this._lines = [];
        let s = new stream.Readable();
        s.push(this._rawData);
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
    record: number,
    rawLines: LineData[]
}> {

    private _logData: LogData;

    constructor(props) {
        super(props);

        this.state = {
            record: 0,
            rawLines: []
        };
    }

    render() {
        return <div id={'list'}>
            <h1>Hi! {this.state.record}</h1>,
            <div className={"content"}>
                <ol>{
                    this.state.rawLines.map((line) => createListItem({
                        "key": line.sequence.toString(),
                        line: line
                    }))
                }
                </ol>
            </div>,
            <footer>Legend: <span className={'ToTarget'}>To Debugee</span> <span className={'FromTarget'}>From Debugee</span>
                <span className={'FromClient'}>From VSCode / PineZorro</span>
                <span className={'ToClient'}>To VSCode / PineZorro</span>
            </footer>
        </div>;
    }

    async componentDidMount() {
        this._logData = new LogData(fileContent);

        await this._logData.preloadAllData();

        let rawLines: LineData[] = [];

        for await (const line of this._logData.readLine()) {
            rawLines.push(line);
        }
        this.setState({
            record: this._logData.LineCount,
            rawLines: rawLines
        });
    }
}

Q(run()).done();
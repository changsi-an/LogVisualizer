import * as Q from 'q';
import * as readline from 'readline';
import * as stream from 'stream';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as tinycolor from 'tinycolor2';
import {initializeIcons} from '@uifabric/icons';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';


import {ReadLogFileContent, RPCService, services} from './RPCServices'
import {createListItem} from './components';
import * as colors from './colors';
import {IButtonProps} from "office-ui-fabric-react";


let readFileLogContent: RPCService<string> = services[ReadLogFileContent.Method];
let fileContent: string;

async function run(): Promise<void> {

    fileContent = await readFileLogContent.call('');

    initializeIcons();

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

interface LegendProps extends IButtonProps {
    primaryColor: string;
}
class Legend extends React.Component<LegendProps, {}>  {
    constructor(props: LegendProps) {
        super(props);
    }

    render() {
        return <DefaultButton
            disabled={ false }
            checked={ false}
            text={this.props.text}
            styles={
                {
                    root: {
                        background: this.props.primaryColor
                    },

                    rootHovered: {
                        background: tinycolor(this.props.primaryColor).brighten(10).toHexString()
                    },

                    rootPressed: {
                        background: tinycolor(this.props.primaryColor).brighten(10).toHexString()
                    }
                }
            }
        />
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
        return <Fabric id={'list'} >
            <h1 className={'ms-font-su'}>Hi! {this.state.record}</h1>
            <div className={"content"}>
                <ol>{
                    this.state.rawLines.map((line) => createListItem({
                        "key": line.sequence.toString(),
                        line: line
                    }))
                }
                </ol>
            </div>,
            <footer>Legend:
                <Legend text={'To Debugee'} primaryColor={colors.ToTargetColor.toHexString()} />
                <Legend text={'From Debugee'} primaryColor={colors.FromTargetColor.toHexString()} />
                <Legend text={'From VSCode / PineZorro'} primaryColor={colors.FromClientColor.toHexString()} />
                <Legend text={'To VSCode / PineZorro'} primaryColor={colors.ToClientColor.toHexString()} />
            </footer>
        </Fabric>;
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
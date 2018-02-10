import * as React from "react";

import {LineData} from './renderer'
import {ReactNode} from "react";

import {breakDownLogStatement, Clause, PlainText, JSONSection} from './parser';


export interface ListItemProps {
    key: string;
    line?: LineData;
}

export interface ListItemState {
}

export class JsonComponent extends React.Component<{
    json: JSONSection;
}, {}>{
    render() {
        return <div className={'jsonClause'}>
            <span className={"emoji"}>↔️</span>
            <span>{this.props.json.text}</span>
            <span className={"emoji"}>↔️</span>
        </div>
    }
}

export class PlainTextComponent extends React.Component<{
    text: PlainText
}, {}>{
    render() {
        return <span>{this.props.text.text}</span>
    }
}

export class ListItem extends React.Component<ListItemProps, ListItemState> {
    constructor(props) {
        super(props);
    }


    protected CreateClauseComponents(): ReactNode {
        const clauses: Clause[] = breakDownLogStatement(this.props.line.text);

        return <React.Fragment>
            {
                clauses.map((clause: Clause) => {
                    if (clause instanceof JSONSection) {
                        return <JsonComponent json={clause}/>
                    } else if (clause instanceof  PlainText) {
                        return <PlainTextComponent text={clause}/>
                    } else {
                        return <div/>;
                    }
                })
            }

        </React.Fragment>;
    }

}

class PlatTextListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()}>{this.props.line.text}</li>;
    }
}

class ToTargetListItemComponent extends ListItem {
    constructor(props) {
        super(props);

        console.log(breakDownLogStatement(this.props.line.text));
    }

    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'ToTarget'}>
            {this.CreateClauseComponents()}
        </li>;
    }
}

class FromTargetListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'FromTarget'}>{this.CreateClauseComponents()}</li>;
    }
}

class ToClientListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'ToClient'}>{this.CreateClauseComponents()}</li>;
    }
}

class FromClientListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'FromClient'}>{this.CreateClauseComponents()}</li>;
    }
}


export function createListItem(props: ListItemProps): ReactNode {
    let cls: any = ToTargetListItemComponent;

    if (props.line.text.startsWith("→ To target:")) {
        cls = ToTargetListItemComponent;
    } else if (props.line.text.startsWith("← From target:")) {
        cls = FromTargetListItemComponent;
    } else if (props.line.text.startsWith("To client:")) {
        cls = ToClientListItemComponent;
    } else if (props.line.text.startsWith("From client:")) {
        cls = FromClientListItemComponent;
    } else {
        cls = PlatTextListItemComponent;
    }

    return React.createElement(cls, props);
}
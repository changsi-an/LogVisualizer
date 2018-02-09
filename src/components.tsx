import * as React from "react";

import {LineData} from './renderer'
import {ListItemProps} from "../out/components";
import {ReactNode} from "react";

export interface ListItemProps {
    key: string;
    line?: LineData;
}

export interface ListItemState {
}

export class ListItem extends React.Component<ListItemProps, ListItemState> {
    constructor(props) {
        super(props);
    }
}

class PlatTextListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()}>{this.props.line.text}</li>;
    }
}

class ToTargetListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'ToTarget'}>{this.props.line.text}</li>;
    }
}

class FromTargetListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'FromTarget'}>{this.props.line.text}</li>;
    }
}

class ToClientListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'ToClient'}>{this.props.line.text}</li>;
    }
}

class FromClientListItemComponent extends ListItem {
    render(): React.ReactNode {
        return <li key={this.props.line.sequence.toString()} className={'FromClient'}>{this.props.line.text}</li>;
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
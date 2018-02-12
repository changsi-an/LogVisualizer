interface stackFrame {
    position: number;
    char: string;
}

export interface Clause {
    start: number;
    end: number;
}

export class PlainText implements Clause {
    public style: string;

    constructor(public text: string, public start: number, public end: number) {
    }
}

export class JSONSection extends PlainText{
    constructor(text: string, start: number, end: number, public obj: any){
        super(text, start, end);
    }


}

function tryParseJson(str: string): any {
    try {
        return JSON.parse(str);
    } catch(e) {
    }

    str = str.replace(/\\"/g, "\"");
    try {
        return JSON.parse(str);
    } catch(e) {
    }


    str = str.replace(/\\\\/g, "\\");
    try {
        return JSON.parse(str);
    } catch(e) {
    }

    return null;
}

export function extractJson(str: string): JSONSection[] {
    let jsons: JSONSection[] = [];
    if (str == null) {
        throw new Error('String is invalid.');
    }
    let stack: stackFrame[] = [];

    const length = str.length;
    let cursor = 0;

    function peek(): string {
        return stack[stack.length - 1].char;
    }

    while(cursor < length) {
        const char = str[cursor];

        if (char !== '{' && char != '}' && char !== '[' && char != ']') {
            cursor ++;
            continue;
        }

        if (char == '{' || char == '[') {
            stack.push({
                position: cursor,
                char: char
            });

            cursor ++;
            continue;
        }
        let stackFrame: stackFrame;
        if ((char == '}' && peek() == '{') ||
            (char == ']' && peek() == '[')) {
            stackFrame = stack.pop();
        } else {
            // Mismatch, discard stack.
            stack = [];
            cursor++;
            continue;
        }

        if (stack.length != 0) {
            cursor++;
            continue;
        }

        const start = stackFrame.position;
        const end = cursor;

        const section = str.substring(start, end + 1);

        let json: any = tryParseJson(section);

        if (json) {
            jsons.push(new JSONSection(section, start, end, json));
        }

        stack = [];
        cursor++;
    }


    return jsons;
}

export function breakDownLogStatement(str: string): Clause[] {
    const jsons = extractJson(str);
    const length = str.length;

    let clauses: Clause[] = [];

    let cursor = 0;

    while (cursor < length) {
        if (jsons.length == 0) {
            break;
        }
        const json = jsons.shift();

        if (json.start > cursor) {
            clauses.push(new PlainText(str.substring(cursor, json.start), cursor,json.start - 1));
        }

        clauses.push(json);

        cursor = json.end + 1;
    }

    if (cursor < length) {
        clauses.push(new PlainText(str.substring(cursor, length), cursor, length - 1));
    }

    return clauses;
}
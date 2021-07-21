type HeaderType = { header: string; type: string };
type Attribute = { name: string; label: string; required: boolean; types: string[], headers: HeaderType[], value: any}

export class GraphContent{
    id: number;
    type: String;
    title: String;
    data: any;
    color: String[];
    width: number;
    height: number;
    attributes: Attribute[] = new Array();
    owner: String;
    publish: boolean;
    nlines: number;
}

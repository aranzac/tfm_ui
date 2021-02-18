type HeaderType = { header: string; type: string };
type Attribute = { name: string; required: boolean; types: string[], headers: HeaderType[], value: any}

export class GraphContent{
    type: String;
    title: String;
    data: any[];
    color: String | String[];
    width: number;
    height: number;
    attributes: Attribute[] = new Array();
    owner: String;
}
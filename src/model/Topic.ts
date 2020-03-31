import { Node } from "./Node";
import { Member } from "./Member";

export interface Topic {
    node: Node
    member: Member
    last_reply_by: string
    last_touched: number
    title: string
    url: string
    created: number
    content: string
    content_rendered: string
    last_modified: number
    replies: number
    id: number
}
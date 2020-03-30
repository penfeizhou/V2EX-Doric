import { BridgeContext, network } from "doric";
import { Topic } from "../model/Topic";

export async function getHotTopic(context: BridgeContext) {
    const ret = await network(context).get("https://www.v2ex.com/api/topics/hot.json")
    return JSON.parse(ret.data) as Topic[]
}

export async function getLatestTopic(context: BridgeContext) {
    const ret = await network(context).get("https://www.v2ex.com/api/topics/latest.json")
    return JSON.parse(ret.data) as Topic[]
}
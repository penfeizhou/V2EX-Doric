import { notification, Group, vlayout, layoutConfig, Gravity, IVLayout, text, Text, Color, navbar, loge, ViewHolder, ViewModel, VMPanel, list, List, ListItem, listItem, LayoutSpec } from "doric";
import { getHotTopic } from "./api/topic";
import { Topic } from "./model/Topic";

interface HotTopicModel {
    topics: Topic[]
}

class HotTopicVH extends ViewHolder {
    topicList!: List
    build(root: Group): void {
        this.topicList = list({
            layoutConfig: layoutConfig().most(),
            itemCount: 0,
            renderItem: () => new ListItem
        })
            .in(root)
    }
}

class HotTopicVM extends ViewModel<HotTopicModel, HotTopicVH> {

    async request(state: HotTopicModel, vh: HotTopicVH) {
        const result = await getHotTopic(context)
        this.updateState(it => it.topics = result)
        notification(context)
    }

    onAttached(state: HotTopicModel, vh: HotTopicVH): void {
        this.request(state, vh)
    }
    onBind(state: HotTopicModel, vh: HotTopicVH): void {
        vh.topicList.itemCount = state.topics.length
        vh.topicList.renderItem = (idx) => {
            const topic = state.topics[idx]
            return listItem(
                text({
                    text: topic.title
                }),
                {
                    layoutConfig: layoutConfig().most().configHeight(LayoutSpec.FIT),
                })
        }
    }
}

@Entry
class V2EX extends VMPanel<HotTopicModel, HotTopicVH> {
    onShow() {
        navbar(context).setTitle("V2EX社区")
    }
    getViewModelClass() {
        return HotTopicVM
    }
    getViewHolderClass() {
        return HotTopicVH
    }
    getState() {
        return {
            topics: []
        }
    }
}
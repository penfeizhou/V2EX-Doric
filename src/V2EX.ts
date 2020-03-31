import { notification, Group, vlayout, layoutConfig, Gravity, stack, text, Color, navbar, ViewHolder, ViewModel, VMPanel, list, List, ListItem, listItem, LayoutSpec, hlayout, image, ScaleType, gravity, HLayout, scroller, modal } from "doric";
import { getHotTopic, getLatestTopic } from "./api/topic";
import { Topic } from "./model/Topic";
import { Node } from "./model/Node"

const primaryTextColor = Color.parse("#778087")


function layoutItem(topic: Topic) {
    return hlayout(
        [
            image({
                imageUrl: "https:" + topic.member.avatar_large,
                layoutConfig: layoutConfig().just(),
                width: 24,
                height: 24,
                corners: 4,
            }),
            vlayout(
                [
                    hlayout(
                        [
                            text({
                                text: topic.node.title,
                                textSize: 12,
                                textColor: Color.parse("#999999"),
                                backgroundColor: Color.parse("#f5f5f5"),
                                padding: {
                                    left: 2,
                                    right: 2,
                                    top: 2,
                                    bottom: 2,
                                },
                                corners: 2,
                            }),
                            text({
                                text: "  •  ",
                                textSize: 12,
                                textColor: Color.parse("#999999"),
                            }),
                            text({
                                text: topic.member.username,
                                textSize: 14,
                                textColor: primaryTextColor,
                                fontStyle: "bold"
                            }),
                        ],
                        {
                            gravity: Gravity.CenterY,
                        }),
                    text({
                        text: topic.title,
                        maxLines: 2,
                        textAlignment: Gravity.Left,
                        fontStyle: "bold",
                        textSize: 16,
                        textColor: primaryTextColor,
                    }),
                ],
                {
                    layoutConfig: {
                        widthSpec: LayoutSpec.MOST,
                        heightSpec: LayoutSpec.FIT,
                    },
                    space: 5,
                }),
        ],
        {
            space: 5,
            layoutConfig: {
                widthSpec: LayoutSpec.MOST,
                heightSpec: LayoutSpec.FIT,
                alignment: gravity().left().top(),
            },
        })
}

function layoutNodeTab(node: string | Node, selected = false) {
    return text({
        text: typeof node === "string" ? node : node.title,
        textSize: 16,
        textColor: selected ? Color.WHITE : primaryTextColor,
        padding: {
            left: 5,
            right: 5,
            top: 1,
            bottom: 1,
        },
        backgroundColor: selected ? Color.GRAY : Color.TRANSPARENT,
    })
}

class HotTopicModel {
    topics: Topic[] = []
    selectedTab: string | Node = "最热"
    get nodes() {
        const nodesMap: Map<number, Node> = new Map
        this.topics.forEach(e => {
            nodesMap.set(e.node.id, e.node)
        })
        return [...nodesMap.values()]
    }

    get tabs(): Array<string | Node> {
        return ["最热", "最新", ...this.nodes]
    }
}

class HotTopicVH extends ViewHolder {
    topicList!: List
    tabs !: HLayout
    build(root: Group): void {
        vlayout(
            [
                scroller(
                    this.tabs = hlayout(
                        [],
                        {
                            layoutConfig: {
                                widthSpec: LayoutSpec.FIT,
                                heightSpec: LayoutSpec.FIT,
                            },
                            space: 10,
                            gravity: Gravity.CenterY,
                        }),
                    {
                        layoutConfig: {
                            widthSpec: LayoutSpec.MOST,
                            heightSpec: LayoutSpec.FIT,
                        },
                    }
                ),
                this.topicList = list({
                    layoutConfig: layoutConfig().most(),
                    itemCount: 0,
                    renderItem: () => new ListItem
                })
            ],
            {
                layoutConfig: layoutConfig().most(),
                space: 5,
            }
        ).in(root)
    }
}



class HotTopicVM extends ViewModel<HotTopicModel, HotTopicVH> {

    async requestHot(state: HotTopicModel, vh: HotTopicVH) {
        const result = await getHotTopic(context)
        this.updateState(it => it.topics = result)
    }
    async requestLatest(state: HotTopicModel, vh: HotTopicVH) {
        const result = await getLatestTopic(context)
        this.updateState(it => it.topics = result)
    }

    onAttached(state: HotTopicModel, vh: HotTopicVH): void {
        this.requestHot(state, vh)
    }

    onBind(state: HotTopicModel, vh: HotTopicVH): void {
        vh.topicList.itemCount = state.topics.length
        vh.tabs.children.length = 0
        state.tabs.forEach(e => {
            vh.tabs.addChild(layoutNodeTab(e, e === state.selectedTab).also(v => {
                v.onClick = async () => {
                    this.updateState(state => {
                        state.selectedTab = e
                    })
                    if (e === "最热") {
                        await this.requestHot(state, vh)
                    } else if (e === "最新") {
                        await this.requestLatest(state, vh)
                    }
                }
            }))
        })
        vh.topicList.renderItem = (idx) => {
            const topic = state.topics[idx]
            return listItem(
                [
                    layoutItem(topic),
                ],
                {
                    layoutConfig: {
                        widthSpec: LayoutSpec.MOST,
                        heightSpec: LayoutSpec.FIT,
                    },
                    padding: {
                        top: idx === 0 ? 0 : 10,
                        left: 5,
                    },
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
        return new HotTopicModel
    }
}
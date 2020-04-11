import { Group, vlayout, layoutConfig, Gravity, text, Color, navbar, ViewHolder, ViewModel, VMPanel, list, List, ListItem, listItem, LayoutSpec, hlayout, image, ScaleType, gravity, HLayout, scroller, modal } from "doric";
import { getHotTopic, getLatestTopic } from "./api/topic";
import { Topic } from "./model/Topic";
import { Node } from "./model/Node"
import data from './hot.json'

const primaryTextColor = Color.parse("#778087")


function layoutItem(topic: Topic, idx: number) {
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
                        maxLines: 0,
                        textAlignment: Gravity.Left,
                        fontStyle: "bold",
                        textSize: 16,
                        textColor: primaryTextColor,
                    }),
                    hlayout(
                        [
                            text({
                                text: "刚刚",
                                textSize: 12,
                                textColor: Color.parse("#999999"),
                            }).also(it => {
                                const time = new Date().getTime() - topic.last_touched * 1000
                                const seconds = Math.floor(time / 1000)
                                if (seconds < 60) {
                                    it.text = `${seconds}秒前`
                                } else {
                                    const minutes = Math.floor(seconds / 60)
                                    if (minutes < 60) {
                                        it.text = `${minutes}分钟前`
                                    } else {
                                        const hours = Math.floor(minutes / 60)
                                        if (hours < 24) {
                                            it.text = `${hours}小时${minutes % 60 !== 0 ? `${minutes % 60}分钟` : ""}前`
                                        } else {
                                            const days = Math.floor(hours / 24)
                                            it.text = `${days}天${days % 24 !== 0 ? `${days % 24}小时` : ""}前`
                                        }
                                    }
                                }
                            }),
                            text({
                                text: " " + idx + "  •  ",
                                textSize: 12,
                                textColor: Color.parse("#999999"),
                            }),
                            text({
                                text: "最后回复来自 ",
                                textSize: 12,
                                textColor: Color.parse("#999999"),
                            }),
                            text({
                                text: topic.last_reply_by,
                                textSize: 12,
                                textColor: primaryTextColor,
                                fontStyle: "bold",
                            }),
                        ]
                    )
                ],
                {
                    layoutConfig: {
                        widthSpec: LayoutSpec.JUST,
                        heightSpec: LayoutSpec.FIT,
                        weight: 1,
                    },
                    space: 5,
                }),
            text({
                text: `${topic.replies}`,
                layoutConfig: {
                    widthSpec: LayoutSpec.FIT,
                    heightSpec: LayoutSpec.FIT,
                    alignment: Gravity.CenterY,
                },
                padding: {
                    left: 10,
                    right: 10,
                    top: 2,
                    bottom: 2,
                },
                textSize: 12,
                corners: 10,
                backgroundColor: Color.parse("#aab0c6"),
                textColor: Color.WHITE,
                fontStyle: "bold",
            })
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
                    layoutConfig: layoutConfig().most().configMargin({ bottom: Environment.hasNotch ? 24 : 0 }),
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
        this.updateState(state => state.topics = data as Topic[])
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
                    layoutItem(topic, idx),
                ],
                {
                    layoutConfig: {
                        widthSpec: LayoutSpec.MOST,
                        heightSpec: LayoutSpec.FIT,
                    },
                    padding: {
                        top: idx === 0 ? 0 : 10,
                        left: 10,
                        right: 10,
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
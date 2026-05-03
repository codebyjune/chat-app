export type Conversation = {
  id: number
  name: string
  message: string
  time: string
  avatar: string
  active: boolean
}

export type ChatMessage = {
  id: number
  from: string
  department?: string
  text: string
  self: boolean
  time: string
  online?: boolean
}

export const conversations: Conversation[] = [
  {
    id: 1,
    name: '陈安维',
    message: '设计稿已经确认，我会在中午前把最终素材发你。',
    time: '09:24',
    avatar: 'AC',
    active: true,
  },
  {
    id: 2,
    name: '朴美娜',
    message: '新手引导评审可以改到下午 3:30 吗？',
    time: '08:58',
    avatar: 'MP',
    active: false,
  },
  {
    id: 3,
    name: '金诺亚',
    message: '我已经提交 API 修复了，麻烦帮我看下重试逻辑。',
    time: '昨天',
    avatar: 'NK',
    active: false,
  },
  {
    id: 4,
    name: '李素菲',
    message: '这周末一起吃饭吗？我找到了河边一家不错的店。',
    time: '昨天',
    avatar: 'SL',
    active: false,
  },
]

export const messages: ChatMessage[] = [
  {
    id: 1,
    from: '小雅',
    department: '研发部',
    text: '@小雅，新的交付内容能不能在中午前帮忙过一下？',
    self: false,
    time: '10:32',
    online: true,
  },
  {
    id: 2,
    from: '你',
    text: '可以，我先看一下，过几分钟把反馈发你。',
    self: true,
    time: '10:34',
  },
  {
    id: 3,
    from: '美嘉',
    department: '研发部',
    text: '好的，我还把设置页空状态的文案也补上了。',
    self: false,
    time: '10:36',
    online: false,
  },
  {
    id: 4,
    from: '你',
    text: '我这边看起来没问题，等移动端间距走完 QA 就可以发了。',
    self: true,
    time: '10:40',
  },
  {
    id: 5,
    from: '小雅',
    department: '研发部',
    text: '处理好了，我也顺手在任务线程里 @小雅 留了说明。',
    self: false,
    time: '10:42',
    online: true,
  },
]

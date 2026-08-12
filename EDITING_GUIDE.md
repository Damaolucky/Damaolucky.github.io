# Hua Zhou 个人主页编辑指南

网站只有一个最终版本：主页地址是 `/`，旧地址 `/v1` 仅用于兼容跳转。日常更新主要修改 `app/content/` 中的数据，不需要调整页面布局或动画。

## 更新 Selected Work

`app/content/papers.ts` 是 **Selected Work 唯一的数据来源**。找到 `export const papers` 数组，复制一个现有的 `{ ... }` 条目，粘贴到希望显示的位置，再替换内容：

```ts
{
  id: "my-new-project",
  title: "My New Project",
  authors: ["Hua Zhou", "Collaborator Name"],
  venue: "UW–Madison · advised by Prof. Name",
  venueShort: "Project · 2026",
  year: 2026,
  topics: ["worlds", "motion"],
  summary: "One or two sentences describing the problem, method, and result.",
  kind: "Project",
  art: "frames",
  links: [
    { label: "Project", href: "https://example.com/project" },
    { label: "Code", href: "https://github.com/Damaolucky/repository" },
  ],
},
```

### 字段说明

- `id`：每条内容必须唯一；建议使用小写英文和连字符，例如 `video-generation-2026`。
- `title`：论文或项目标题。
- `authors`：作者列表；只有一位作者时也写成数组，例如 `["Hua Zhou"]`。
- `venue`：完整的机构、会议或导师信息。
- `venueShort`：卡片上显示的简短类型与时间。
- `year`：四位数字，不加引号。
- `topics`：研究方向标签，可使用 `"worlds"`、`"motion"`、`"interaction"`，也可以填写多个。
- `summary`：建议用一到两句说明研究问题、方法和结果。
- `kind`：使用 `"Research"`、`"Project"` 或 `"Paper"`。
- `art`：没有项目图片时使用的简洁卡片图案，可选 `"ribbons"`、`"frames"`、`"field"`、`"echo"`、`"blocks"`。
- `links`：项目按钮列表。按钮名称使用 `"Paper"`、`"Project"`、`"Code"` 或 `"Video"`；没有链接时写 `links: []`。
- `award`：可选字段，例如 `award: "Best Paper"`。

页面按照数组中第一次出现的年份建立分组，并保留同一年内的条目顺序。建议将整个数组按年份从新到旧排列。

## 更新简介、链接和 News

这些内容位于 `app/content/profile.ts`：

- `profile.bioParagraphs`：首页简介；每个内层数组是一段文字。
- `profile.email` 与 `profile.links`：邮箱、GitHub 和 Google Scholar。
- `news`：Recent Notes 的日期和内容。
- `miscText`：页面底部的 Misc 文本。
- `lastUpdated`：页脚显示的更新时间；同时填写机器可读的 `dateTime` 和展示用的 `label`。

简介中的普通片段写作 `{ text: "..." }`；需要加粗时增加 `strong: true`，需要链接时增加 `href`，学校名称可通过 `schoolMark: "sdu" | "uwmadison" | "cornell"` 显示校徽。

## 外观与互动

最终版本固定使用 Round 字体和 Classic 心形。页面默认纯白背景，并保留 Lavender/White 入口切回薰衣草花瓣背景；这个选择与 Motion/Still、Bright/Dark 相互独立。头像默认显示二次元版本，点击后在二次元与油画版本之间平滑切换。

在页面空白处按住鼠标左键 200 毫秒即可开始画线，松开后线条保留两秒再渐隐，Izumi 会换成画家立绘并回应 `Nice painting!`。点击左上角心形会触发她的比心立绘和黑白爱心对话。桌宠只保留 Izumi：点击触发动作，按下即可立即拖动；抓起时确定空中朝向，升空后不会转向，并使用专属转向和落地动画。

## 本地查看与检查

保存文件后，本地页面通常会自动刷新。若预览尚未运行：

```bash
cd /Users/damao/Documents/webpage
npm run dev
```

打开 `http://localhost:3000/`。修改完成后运行：

```bash
npm run lint
npm test
```

`npm test` 会执行正式构建和页面检查；若出现错误，请先修复再发布。

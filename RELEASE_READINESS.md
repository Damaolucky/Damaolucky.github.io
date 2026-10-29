# 首页发布记录 · 2026-10-28

目标网址：https://damaolucky.github.io/

## 当前版本

- 保留淡紫色主页和雪夜猫猫，项目与猫猫顶部对齐。
- Historical Map 为唯一项目，使用叠层地图插画。
- 删除 Updates，更新简介、Misc 和最后修改日期。
- 桌宠默认关闭，保留手动开关与偏好记忆。
- 修复文本选择误触画笔；文字长按不启动画笔，已有选区优先保留。
- GitHub Pages 使用 Next.js 静态导出，Sites 使用独立 Vinext 构建。

## 验证

发布流程构建页面并运行自动化检查，覆盖静态资源、metadata、导航、旧地址跳转、主题和宠物偏好、文本选择以及资源完整性。浏览器检查覆盖项目配图、猫猫互动和移动端布局。

通过 GitHub Actions 的 **Publish personal homepage** 工作流发布，部署状态以该工作流和线上页面验证为准。

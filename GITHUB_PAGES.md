# GitHub Pages

网站：**https://damaolucky.github.io/**  
源码：https://github.com/Damaolucky/Damaolucky.github.io

## 发布方式

使用 GitHub Actions 发布静态文件。`.github/workflows/pages.yml` 在 main 更新或手动运行时，安装锁定依赖、导出页面、检查资源并部署到 GitHub Pages。构建目录 `out/` 不提交到源码仓库。

```sh
npm ci
npm run build:pages
npm run test:pages
```

- `app/content/profile.ts`：简介、Misc、联系方式及更新日期。
- `app/content/papers.ts`：项目资料与配图。Historical Map 使用叠层地图。
- GitHub 构建生成专用 canonical、Open Graph、robots.txt 和 sitemap.xml。
- `/v1/` 为旧链接提供静态跳转，`/mono/` 保留为不被索引的比较版本。
- Pets 默认关闭，文字可选中；空白处仍支持画笔。

## 更新与回滚

提交网站改动到 main 后查看 **Publish personal homepage** 工作流，部署成功后检查线上页面。回滚时撤销对应源代码提交并重新发布。

当前工作区含有与网站无关的文件，提交时只选择网站源码、资源、配置和测试；不要直接 `git add .`。

Sites 版本仍通过 `npm run build` 与 `.openai/hosting.json` 独立部署，其访问权限保持不变。

参考：[Next.js 静态导出](https://nextjs.org/docs/app/guides/static-exports)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

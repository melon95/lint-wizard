# lint-wizard

lint-wizard is a frontend code style tools

## Idea

就这几年来前端发展很快，越来越多的新东西都出来了，随之而来时前端的复杂度也大大提升了。

现在如果从头开始搭建一个前端工程，等到搭建完成估计一天就过去了。这其中很多时间都花在了技术选型和工具配置上面。

<aside>
💡 当然你也可以通过官方脚手架和其他工具提供的脚手架来快速搭建，例如：create-react-app、create-next-app等。这样会节约部分时间。

</aside>

因此就像写一个配置工具，来简化大部分的非核心配置：ESLint、Prettier、StyleLint、CommitLint、husky、lint-stage等。

## 开发思路

1. 参考 `@eslint/config` 设计问题，一步步的收集用户的需求，例如：框架、代码风格、是否使用TypeScript、包管理工具、配置文件后缀名等
2. 根据框架、代码风格、是否使用 TypeScript 来决定采取不同的模板的配置

## 依赖项

- commander
- inquirer
- chalk
- ora
- configstore
- download-git-repo

## 里程碑

### v1

- [ ]  根据需求自动生成 ESLint、Prettier、StyleLint配置
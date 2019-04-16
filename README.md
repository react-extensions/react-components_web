# React Components And API Site

基于React开发的Web端组件库及其对应的API文档。

## 开发前置知识

#### 概述
此项目集**组件开发**及**针对组件的API说明开发**于一体。

项目开发基于[flammae](https://github.com/LiZ2z/flammae)，如果你想要开发此项目，确保已经全局安装[flammae](https://github.com/LiZ2z/flammae)。

```bash
npm install flammae -g
```
可以点击[flammae](https://github.com/LiZ2z/flammae)查看其使用说明。

#### 项目目录说明

1. `src/ui-lab`或`src/ui-beta`文件夹用于存放正在开发或预研的组件，确保不要将它们发布出去。

2. `src/ui`用于存放已经开发完成的组件。

3. `src/libs`用于存放通用工具库。

4. `src/components`用于存放API网页开发用到的通用组件。

5. `src/styles`用于存放所有配置样式：组件的配置样式、API网页的全局样式。可查看[flammae](https://github.com/LiZ2z/flammae)获取更多信息。
6. `src/pages`用于存放对应组件的示例或开发页面，我们在这个页面上做对应组件的开发及测试工作。可查看[flammae](https://github.com/LiZ2z/flammae)获取更多信息。

7. `src/docs`用于存放组件的API说明文档。可查看[flammae](https://github.com/LiZ2z/flammae)获取更多信息。

7. `src/templates`为flammae专用文件夹。可查看[flammae](https://github.com/LiZ2z/flammae)获取更多信息。


## 开发步骤

1. 拉取一个新的分支

2. 在项目根目录执行`flammae run dev`，进入开发模式

3. 开发组件（具体见下方开发事项）

4. 编写对应的API说明文档

5. 合并。如果还在用svn，请通知主要开发者进行code review并合并主干或拒绝；如果已使用git，则进行pull request，主要开发者进行code review后合并主干或拒绝

6. 由主要开发者进行打包并发布项目


## 开发事项

### 通用规范

#### 文件及文件夹

1. 文件及文件夹命名规则：足够语义化及简短、小写、字符用`-`连接。

2. 文件之间足够内聚及解耦。将同一功能模块的文件放入文件夹中，不要跟其它文件混合放置，例如：将table.jsx与table.css放入table文件夹中。

3. 文件后缀具有说明作用，正确使用后缀。内部使用了`jsx`语法的文件以`.jsx`做文件后缀，其它javascript文件使用`.js`结尾。

#### javascript命名规范

1. 变量名及函数名之类（以下全以变量名代替）需足够语义化（必要时可以很长）。语义化便于阅读，且代码通过打包后名称会被压缩，不用担心代码体积问题。

2. 变量名命名遵循javascript通用命名规则。

3. 常量尽量使用大写字母及下划线进行命名。

#### css规则

1. 组件类名以`r-`（react-components）开头防止样式冲突。
```jsx
<button className='r-button'></button>
```
2. 局部类名使用`_`开头。
```jsx
<button className='r-button _danger'></button>
```

3. `_`开头类名必须作为次级类名使用，不可单独使用。例如：
```less
// 正确
.r-button {
    ._primary{
        background:blue;
    }
}
.r-button{
    ._danger{
        backgroung: red;
    }
}
// 错误
._primary{
    background:blue;
}

```
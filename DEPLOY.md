# 手机使用 & GitHub Pages 部署指南

## 回答你的3个问题

### ❓ 本地还是线上？
目前是本地运行（`npm run dev` 只在你电脑上可用）。但 `npm run build` 生成的文件是纯静态网页，放到任何服务器就能线上访问。

### ❓ 计算是联网还是内置？
**100%内置**。所有历法算法（八字、六爻、节气、农历转换）都打包进了JS文件，排盘不需要联网。唯一联网的是Google Fonts字体（断网时自动用系统宋体，不影响功能）。

### ❓ 手机怎么用？
两种方式：

---

## 方式一：GitHub Pages 部署（推荐）

免费、永久、手机浏览器直接访问。

### 步骤：

1. **注册 GitHub 账号**
   - 去 https://github.com 注册一个账号（如果已有就跳过）

2. **创建仓库**
   - 登录 GitHub → 点右上角 "+" → "New repository"
   - Repository name 填：`destiny`
   - 选 Public（公开）
   - 不要勾选 "Initialize with README"（我们已经有了）
   - 点 "Create repository"

3. **推送代码**
   在你的电脑终端运行：
   ```bash
   cd C:\Users\leo\Desktop\mess\funnything\destiny
   git remote add origin https://github.com/你的用户名/destiny.git
   git branch -M main
   git push -u origin main
   ```
   （把"你的用户名"换成你的GitHub用户名）

4. **开启 GitHub Pages**
   - 进入仓库页面 → Settings → Pages
   - Source 选 "GitHub Actions"
   - 保存

5. **等待部署完成**
   - 推送代码后，GitHub Actions 会自动构建部署（约1-2分钟）
   - 部署完成后，你的网站地址是：`https://你的用户名.github.io/destiny/`

6. **手机访问**
   - 在手机浏览器输入上面的地址
   - 可以收藏/添加到主屏幕，就像一个App一样使用

---

## 方式二：局域网共享（不部署线上）

如果你不想注册GitHub，也可以让手机通过局域网访问电脑：

```bash
cd C:\Users\leo\Desktop\mess\funnything\destiny
npm run dev -- --host
```

这会让开发服务器暴露到局域网。终端会显示类似：
```
Network: http://192.168.x.x:5173/
```

手机连同一个WiFi，在浏览器输入这个地址就能访问。

缺点：电脑必须开着、必须在同一个WiFi下才能用。

---

## 构建产物

`npm run build` 后的 `dist/` 文件夹：
- 总大小约 616KB（gzip压缩后约 186KB）
- 纯静态文件：1个HTML + 1个CSS + 1个JS
- 可以放到任何Web服务器（阿里云、腾讯云、自己的服务器等）

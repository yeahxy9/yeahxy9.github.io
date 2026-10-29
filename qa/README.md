# 网站质量检查

本目录是独立的测试工具包，不加入网站前端生产依赖。

## 核心要求

- 页面与问答先可交互，全量媒体后台预载；不等待networkidle或77张图全部完成。
- Playwright在桌面/手机参数下分别验证：挂起媒体仍能进入问答、两路13题全随缘/刷新恢复/分享、关注与观看目标、主体脚本失败提示。
- 对外站仅核对链接用途，不代表平台登录后的播放或关注已验收。
- Lighthouse保留实际全量预载，进行3次测试并保存性能报告。不将77图全部下载的时间等同首屏可用时间。
- 手机参数模拟不是旧手机或大陆运营商实测。

## 执行

Node 24及以上。安装时不执行依赖脚本：

    npm ci --ignore-scripts --legacy-peer-deps
    npx --no-install playwright install chromium
    npm test
    npm run performance

本地默认测试../dist；发布仓库设置QA_SITE_ROOT=..以测试现有公开文件。


## 安全及依赖

Playwright Test 1.64.1（Apache-2.0），Lighthouse CI 0.15.1（Apache-2.0）。LHCI原锁定Lighthouse12存在旧依赖问题，本包覆盖到Lighthouse13.6.0、tmp0.2.7、uuid11.1.1、basic-ftp6.2.3。覆盖兼容性须由实际测试验证，不能只看安装成功。

报告只保存在本地或本仓库Actions工件，不启用LHCI公开临时存储；不加入Cookie、真实用户答案、账号凭据、遥测数据或内部项目文件。工作流只有手动触发，无持续巡检、告警外发、DNS修改或服务开通。


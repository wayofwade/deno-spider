# 运行deno的代码
- 有网络请求的：
    - deno run --allow-net denoFund.js
- 读取文件的：
    - deno run --allow-net --allow-read --allow-write denoFund.js 
- 允许所有权限
    - deno run --allow-all denoFund.js
# 运行node的代码
 - node nodeFund.js
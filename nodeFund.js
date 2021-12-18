 /**
  * node nodeSpider.js
  * -----node--消耗时间 1226（page3）
  * -----node--消耗时间 1279
  * -----node--消耗时间 1213
  * -----node--消耗时间 1286
  * -----node--消耗时间 10309（page30）
  * -----node--读取文件之后消耗时间 10089
  * -----node--读取文件之后消耗时间 32909（page=100）
  * -----node--读取文件之后消耗时间 33073
  * -----node--读取文件之后消耗时间 32282
  */
import fetch from 'node-fetch';

 /**
  * deno run --allow-all denoSpider.js
  * 挑选近三年收益率> 100% && 成立3年以上 && 规模大于5亿
  * -----deno--消耗时间 814
  * -----deno--消耗时间 847
  * -----deno--消耗时间 754
  * -----deno--消耗时间 768
  * -----deno--文件之后消耗时间 6002
  * -----deno--文件之后消耗时间 6184
  * -----deno--文件之后消耗时间 19749(100)
  * -----deno--文件之后消耗时间 19171
  * -----deno--文件之后消耗时间 19553
  * -----deno--文件之后消耗时间 19415
  */
 const startTime = new Date().getTime()
 const headers = {
     'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
 }
 // 基金的id数组
 const fundIdList = []
 // 近收益率在100%以上的（接口删选），成立3年以上，规模大于1亿的数组
 const goodFundList = [];
 /**
  * method： 请求近3年收益率大于100%的基金
  * 页面：https://danjuanfunds.com/rank/performance
  * 接口：https://danjuanfunds.com/djapi/v3/filter/fund?type=1&order_by=3y&size=20&page=1
  */
 const getFundList = () => {
     const SIZE = 100; // 300就可以查询出来了， SIZE不要大于10000什么的，避免把接口搞挂了，有法律责任
     const page = 1;
     const TYPE = 1
     const order_by = '3y'
     const url = `https://danjuanfunds.com/djapi/v3/filter/fund?type=${TYPE}&order_by=${order_by}&size=${SIZE}&page=${page}` // 接口
     return fetch(url, headers)
         .then(function(res) {
             return res.json();
         })
         .then(function(myJson) {
             const resData = myJson.data
             resData.items.forEach((item,index) => {
                 if (Number(item.yield) >= 100) {
                     fundIdList.push(item.fd_code);
                 }
             })
         });
 }

 /**
  *  请求接口
  *  页面: https://danjuanfunds.com/funding/011463?channel=1300100141
  *  接口: https://danjuanfunds.com/djapi/fund/006926
  */
 const getFundDetail = (id) => {
     const url = `https://danjuanfunds.com/djapi/fund/${id}` // 接口
     return fetch(url).then(function(res) {
         return res.json();
     });
 }
 /**
  * 过滤基金数据
  */
 const getFilterData = (myJson) => {
     const resData = myJson.data
     const startDate = resData.found_date // 开始时间
     const code = resData.fd_code // 代码
     const manager = resData.manager_name // 基金经理
     const totalMoney = resData.totshare // 金钱规模
     const fullName = resData.fd_full_name // 基金的名字
     const company = resData.keeper_name // 公司名字
     const fundDerived = resData.fund_derived // 收益
     const unitNav = fundDerived.unit_nav // 历史累计收益
     const keepTime = myJson.keepTime // 管理时间
     const fundDetail = {
         startDate,code,manager,totalMoney,fullName,company,unitNav, fundDerived,keepTime
     }
     return fundDetail
 }

 /**
  * 基金经理列表
  */
 const getManagerDetail = (id) => {
     const url = `https://danjuanfunds.com/djapi/fund/detail/${id}` // 接口
     return fetch(url).then(function(res) {
         return res.json();
     });
 }
 const getAllFundData = async () => {
     // 获取所有的基金ID
     await getFundList();
     // 循环请求接口获取基金详情并过滤
     for (let i = 0; i < fundIdList.length; i++) {
         const  id = fundIdList[i]
         const myJson = await getFundDetail(id)
         const managerDetail = await getManagerDetail(id)
         const managerList = managerDetail.data.manager_list.length && managerDetail.data.manager_list[0]

         // 基金经理管理时间
         const keepTime = (managerList.achievement_list || []).filter((item) => {
             return item.fund_code === id
         })[0]?.post_date
         const fundDetail = getFilterData({...myJson, keepTime})
         const total = fundDetail.totalMoney.split('亿');
         // 成立超过7年的基金
         const fundTime = 1000 * 60 * 60 * 24 * 30 * 12 * 7
         // 基金经理在职时间
         const manegeTime = 1000 * 60 * 60 * 24 * 30 * 12 * 3
         const nowTime = new Date().getTime()
         const startTime = new Date(fundDetail.startDate).getTime()
         const keepTimeStamp = new Date(keepTime).getTime()
         if (nowTime - startTime > fundTime && total[0] && total[0] > 10 && nowTime - keepTimeStamp > manegeTime) {
             goodFundList.push(fundDetail)
         }
     }
     writeJson('./fundData.json', goodFundList)
     const endTime = new Date().getTime()
     console.log('-----deno--文件之后消耗时间', endTime - startTime)
 }
 getAllFundData();


 function writeJson(path, data) {
     try {
         const endTime = new Date().getTime()
         console.log('-----deno--消耗时间', endTime - startTime)
         Node.writeTextFileSync(path, JSON.stringify(data));
         return "Written to " + path;
     } catch (e) {
         return e.message;
     }
 }
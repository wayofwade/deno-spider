/**
 * 双色球
 */
import { DOMParser, Element } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// 双色球网站
const result = await fetch(`http://kaijiang.zhcw.com/zhcw/html/ssq/list.html`);
const html = await result.text();


const doc = new DOMParser().parseFromString(html, "text/html");
if (doc) {
  // 去掉表头。从第三行开始包含中奖数据，前两行一定是表头。
  const rows = Array.from(doc.querySelectorAll("tr"))
  const dataRows = rows.slice(2, rows.length - 1);
  const data = dataRows.map((row) => {
    const cells = Array.from((row as Element).querySelectorAll("td"));
    const json = cells.reduce((collection, value, index) => {
      // 每一组中奖数据按照开奖时间、期数、中奖号码、销售额、一等奖数量、二等奖数量依次排序
      const dataKey = [
        "开奖时间", "期数", "中奖号码", "销售额", "一等奖数量", "二等奖数量"
      ]

      // 评估结果
      const evalFunctions = [
        (cell: Element) => cell.innerText,
        (cell: Element) => cell.innerText,
        (cell: Element) => Array.from(cell.querySelectorAll('em')).map(em => (em as Element).innerText),
        (cell: Element) => cell.innerText.replaceAll(',', ''),
        (cell: Element) => parseInt(cell.innerText.trim()),
        (cell: Element) => parseInt(cell.innerText),
      ]

      if(index < dataKey.length){
        // 只有在 dataKey 中的值，才存储
        collection.set(dataKey[index], evalFunctions[index](value as Element));
      }

      return collection;
    }, new Map())
    
    // console.log('json--',json)
    // Map 转换为 Object
    let obj = Object.create(null);
    for (let [k, v] of json) {
      obj[k] = v;
    }
    return obj;
  });

  console.log('------最后解析的数组', data)
}
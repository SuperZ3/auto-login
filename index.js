const { Builder, Browser, By, until } = require('selenium-webdriver');

const JDVC = {
  address: 'https://passport.shop.jd.com/login/index.action',
  user1: ['美厍程序', 'shmsm2023']
}

let driver = null

async function fillPassword(user) {
  driver = await new Builder().forBrowser(Browser.CHROME).build();
  await driver.get(JDVC.address);
  driver.findElement(By.id('loginname')).sendKeys(user[0])
  driver.findElement(By.id('nloginpwd')).sendKeys(user[1])
  driver.findElement(By.id('paipaiLoginSubmit')).click()
  const slider = driver.findElement(By.id('JDJRV-wrap-paipaiLoginSubmit'))
  await driver.wait(until.elementIsVisible(slider), 2000)
  const bigImg = (await driver.findElement(By.css('.JDJRV-bigimg img')).getAttribute('src')).split(',')[-1]
  const smallImg = (await driver.findElement(By.css('.JDJRV-bigimg img')).getAttribute('src')).split(',')[-1]
  console.log(bigImg, smallImg)
}

// 1. selenium 登录京东，填写用户名和密码
// 2. 获取滑块拼图，开线程给 ddddocr 分析，拿到位置
// 3. 模拟鼠标拖动，采用非线形路径
// 4. 是否需要手机登录，发送手机验证码，挂起，等待验证码回传
// 5. 获取指定页面的 cookie
// 6. 与 java 通信
function main() {
  fillPassword(JDVC.user1)
}

main()

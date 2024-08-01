import { Builder, Browser, By, until, WebDriver } from 'selenium-webdriver'
import { BrowserType, User, vcAddress } from './utils';
import cv from '@u4/opencv4nodejs'
import fs from 'node:fs'
import puppeteer, { Page } from 'puppeteer';

async function fillPassword(user: string[], browserType: string) {
  const driver = await new Builder().forBrowser(browserType).build();
  await driver.get(vcAddress);
  // click password login
  await driver.findElement(By.css('.tabs-header-item:nth-child(2)')).click()
  // switch to frame
  const iframe = driver.findElement(By.id('loginFrame'));
  await driver.switchTo().frame(iframe)
  // fill userName and password
  driver.findElement(By.id('loginname')).sendKeys(user[0])
  driver.findElement(By.id('nloginpwd')).sendKeys(user[1])
  await driver.findElement(By.id('paipaiLoginSubmit')).click()
  // sleep 5 second wait captcha img load
  await new Promise((resolve) => setTimeout(resolve, 5000))
  // get captcha img
  const bigImg = (await driver.findElement(By.css('.JDJRV-bigimg img')).getAttribute("src")).split(',')[1]
  const smallImg = (await driver.findElement(By.css('.JDJRV-smallimg img')).getAttribute("src")).split(',')[1]
  return {
    driver,
    bigImg,
    smallImg
  }
}

function getTargetPos(source: string, target: string) {
  const sliderMat = cv.imdecode(Buffer.from(source, 'base64'), cv.COLOR_RGB2GRAY);
  const originalMat = cv.imdecode(Buffer.from(target, 'base64'), cv.COLOR_RGB2GRAY);
  const matched = originalMat.matchTemplate(sliderMat, cv.TM_CCOEFF_NORMED);
  const matchedPoints = matched.minMaxLoc();
  console.log('x: ', matchedPoints.maxLoc.x, matchedPoints);
  return {
    big: matchedPoints.minLoc.x,
    small: matchedPoints.maxLoc.x,
  }
}

async function matchPosition(big: number, small: number, driver: WebDriver) {
  const sliderBtn = await driver.findElement(By.css('.JDJRV-slide-inner.JDJRV-slide-btn'))
  const actions = driver.actions({async: true})
  const rect = await sliderBtn.getRect()
  await actions.dragAndDrop(sliderBtn, {x: big, y: Math.round(rect.y)}).perform();
}

// 1. selenium 登录京东，填写用户名和密码
// 2. 获取滑块拼图，开线程给 ddddocr 分析，拿到位置
// 3. 模拟鼠标拖动，采用非线形路径
// 4. 是否需要手机登录，发送手机验证码，挂起，等待验证码回传
// 5. 获取指定页面的 cookie
// 6. 与 java 通信
async function main() {
  const { bigImg, smallImg, driver } = await fillPassword(User.First, BrowserType.CHROME)
  const {big, small} = getTargetPos(smallImg, bigImg)
  matchPosition(big, small, driver)
}

main()

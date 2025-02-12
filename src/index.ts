import { execSync } from "child_process";
import path from "path";
import {
	Builder,
	Browser,
	By,
	until,
	WebDriver,
	IRectangle,
} from "selenium-webdriver";
import sharp from "sharp";
import trajectory from "./MouseTrack/trajectory.js";
// TODO 做成自动化输入
const JDVC = {
	address: "https://passport.shop.jd.com/login/index.action",
	user: ["Zhangzz5516", "11Zhangzz5516"],
};

let driver: WebDriver;
const SlidersPath = path.join(process.cwd(), "src/Sliders");
type PageSliders = {
	big: {
		imgURL: string;
		imgSize: IRectangle;
	};
	small: {
		imgURL: string;
		imgSize: IRectangle;
	};
};

main();

async function fillPassword() {
	const user = JDVC.user;
	driver = await new Builder().forBrowser(Browser.CHROME).build();
	await driver.get(JDVC.address);
	// TODO: 登陆尝试 5 次
	await driver.sleep(5000);
	driver.findElement(By.id("loginname")).sendKeys(user[0]);
	driver.findElement(By.css("input[type='password']")).sendKeys(user[1]);
	await driver
		.findElement(
			By.css("button.rcd-button.rcd-button--primary.password__submit")
		)
		.click();
	await driver.sleep(5000);
	await driver.wait(
		until.elementIsVisible(
			driver.findElement(By.id("JDJRV-wrap-passwordLoginSlideValidate"))
		),
		2000
	);
}

// 1. selenium 登录京东，填写用户名和密码
// 2. 获取滑块拼图，开线程给 ddddocr 分析，拿到位置
// 3. 模拟鼠标拖动，采用非线形路径
// 4. 与 java 通信
async function main() {
	await fillPassword();
	const { big, small } = await getSlidersImg()
	await processImg(big, "big");
	await processImg(small, "small");

	const distance = recognizeSlider(
		path.join(SlidersPath, "current_big.png"),
		path.join(SlidersPath, "current_small.png")
	);

	await dragDrop(distance);
}

async function getSlidersImg(): Promise<PageSliders> {
	const bigImg = await driver.findElement(By.css(".JDJRV-bigimg img"));
	const bigImgURL = await bigImg.getAttribute("src");
	const bigImgSize = await bigImg.getRect();

	const smallImg = await driver.findElement(By.css(".JDJRV-smallimg img"));
	const smallImgURL = await smallImg.getAttribute("src");
	const smallImgSize = await smallImg.getRect();
	return {
		big: {
			imgURL: bigImgURL,
			imgSize: bigImgSize,
		},
		small: {
			imgURL: smallImgURL,
			imgSize: smallImgSize,
		},
	};
}

async function processImg(
	img: PageSliders["big"] | PageSliders["small"],
	type: "big" | "small"
) {
	const { imgURL, imgSize } = img;
	const base64 = imgURL.replace(/^data:image\/\w+;base64,/, "");
	const dataBuffer = Buffer.from(base64, "base64");

	await sharp(dataBuffer)
		.resize(imgSize.width, imgSize.height)
		.grayscale()
		.toFile(path.join(SlidersPath, `current_${type}.png`));
}

function recognizeSlider(backgroundPath: string, sliderPath: string) {
	const command = `python3 slider_captcha.py ${backgroundPath} ${sliderPath}`;
	const distance = execSync(command).toString().trim();
	return parseFloat(distance);
}

async function dragDrop(distance: number) {
	const handler = driver.findElement(
		By.css(".JDJRV-slide-inner.JDJRV-slide-btn")
	);
	const handlerBox = await handler.getRect();
	const dragX = parseInt(handlerBox.x + handlerBox.width / 2 + 2 + "");
	const dragY = parseInt(handlerBox.y + handlerBox.height / 2 + 3 + "");

	const actions = driver.actions({ async: true });
	// await actions.move({ origin: handler }).press().perform();
	await actions.move({ x: dragX, y: dragY}).press().perform();
	await driver.sleep(300);

	let newX = dragX
	let newY = dragY
	for (const point of trajectory) {
		newX += point.x
		newY += point.y
		console.log(newX, distance, newX - dragX, point)
		if (newX - dragX >= distance) {
			break
		}
		
        await actions.move({ x: newX, y: newY }).perform();
        // await driver.sleep(10); // 模拟移动间隔
    }

	// const totalSteps = 100;
	// const stepTime = 5;
	// let newX = parseInt(dragX + "")
	// let newY = 0
	// let out = false
	// for (let i = 0; i <= totalSteps && !out; i++) {
	// 	const t = i / totalSteps;
	// 	const easeT = easeOutBounce(t, 0, 1, 1);

	// 	newX = newX + parseInt((distance * easeT - 3).toFixed(0));	
	// 	newY = parseInt(Math.random() * 10 - 5 + "");
	// 	if (newX > distance) {
	// 		newX = parseInt((distance + (Math.random() * 100 % 2 === 0 ? 1 : -1) * (Math.random() * 5)) + "")
	// 		out = true
	// 	}
	// 	await actions.dragAndDrop(handler, { x: newX, y: newY }).perform();
	// 	await driver.sleep(stepTime)
	// 	if (newX >= distance) {
	// 		break
	// 	}
	// }
	await driver.sleep(300);
	await actions.release().perform()
}

// function easeOutBounce(t: number, b: number, c: number, d: number) {
// 	if ((t /= d) < 1 / 2.75) {
// 		return c * (7.5625 * t * t) + b;
// 	} else if (t < 2 / 2.75) {
// 		return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
// 	} else if (t < 2.5 / 2.75) {
// 		return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
// 	} else {
// 		return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
// 	}
// }

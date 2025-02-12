let page: Page;

async function newPage() {
	const browser = await launch();
	page = await browser.newPage();

	await page.goto(JDVC.address);
	await sleep(3000);

	await page.waitForSelector("input[type='password']");
	await page.type("#loginname", JDVC.user[0]);
	await page.type("input[type='password']", JDVC.user[1]);
	await page.click("button.rcd-button.rcd-button--primary.password__submit");
}

async function getSliders() {
	await page.waitForSelector(".JDJRV-wrap-passwordLoginSlideValidate");
	const bigImg = await page.waitForSelector(".JDJRV-bigimg img", {
		visible: true,
	});
	const smallImg = await page.waitForSelector(".JDJRV-smallimg img", {
		visible: true,
	});
	const bigImgProperty = await getImgProperty(".JDJRV-bigimg img");
	const smallImgProperty = await getImgProperty(".JDJRV-smallimg img");

	if (
		bigImg === null ||
		smallImg === null
	) {
		return null;
	}

	return {
		big: bigImgProperty,
		small: smallImgProperty,
	};
}

async function getImgProperty(selector: string) {
	if (!page) {
		return null;
	}
	const dimensions: ImgProperty | null = await page.evaluate(() => {
		const element = document.querySelector(selector);
		if (element) {
			const rect = element.getBoundingClientRect();
			const src = element.getAttribute("src")
			return {
				width: rect.width,
				height: rect.height,
				x: rect.x,
				y: rect.y,
				src: src!
			};
		}
		return null;
	});
	return dimensions;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

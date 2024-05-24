import puppeteer from 'puppeteer';
import { logger } from '../logging/logger';

export const parsePage = async (url: string) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: "new",
      defaultViewport: null,
      timeout: 0,
    });
    const page = await browser.newPage();
    await page.goto(url);
    const text = await page.evaluate(() => {
      // @ts-ignore
      Array.from(document.querySelectorAll('a[href]')).forEach(elm => elm.innerText+=`(${elm.href})`)
      // @ts-ignore
      return document.body.innerText;
    });
    await browser.close();
    return text;
  } catch (err) {
    logger.error(err);
    return '';
  }
}
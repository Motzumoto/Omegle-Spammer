import CaptchaSolver from "./captchaSolver";
import { Page } from "puppeteer-core";

async function handleConnection(page: Page, config: any) {
  let frames = await page.frames();
  frames.forEach(async (f) => {
    console.log(f.url(), await f.name());
  });
  let frame = frames.find(async (f) => (await f.name()) == "reCAPTCHA");

  let childFrames = frame?.childFrames();

  childFrames?.map((i) => {
    console.log(i.name());
  });

  if (frame) {
    console.log("Found a captcha");

    let url = new URL(frame.url());

    let captchaGod = new CaptchaSolver(url.searchParams.get("k"));

    await captchaGod.solve();

    captchaGod.on("solving", () => {
      console.log("solving");
    });

    captchaGod.on("solved", async (key: string) => {
      console.log("Solved captcha: ", key);
      page.$eval("#g-recaptcha-response", (i) => {
        i.innerHTML = key;
      });

      new Promise((r) => setTimeout(r, 3000));

      let randomMessage = config.messages[
        Math.floor(Math.random() * config.messages.length)
      ] as string;

      console.log("Sending message");
      await page.focus(".chatmsg");
      await page.keyboard.type(`${randomMessage}`);
      await page.keyboard.press("Enter");

      new Promise((r) => setTimeout(r, 3000));

      console.log("Screenshotting");
      await page.screenshot({ path: `./tmp/${Date.now()}.png` });

      console.log("Disconnecting");
      await page.click(".disconnectbtn");
      await page.click(".disconnectbtn");

      setTimeout(async () => {
        await page.click(".disconnectbtn");
        handleConnection(page, config);
      }, 2000);
    });
  }
  // while (await page.$(".sendbtn[disabled]")) {
  //   console.log("Waiting to connect");
  // }

  // } else {
  //   new Promise((r) => setTimeout(r, 3000));

  //   let randomMessage = config.messages[
  //     Math.floor(Math.random() * config.messages.length)
  //   ] as string;

  //   console.log("Sending message");
  //   await page.focus(".chatmsg");
  //   await page.keyboard.type(`${randomMessage}`);
  //   await page.keyboard.press("Enter");

  //   new Promise((r) => setTimeout(r, 3000));

  //   console.log("Screenshotting");
  //   await page.screenshot({ path: `./tmp/${Date.now()}.png` });

  //   console.log("Disconnecting");
  //   await page.click(".disconnectbtn");
  //   await page.click(".disconnectbtn");

  //   setTimeout(async () => {
  //     await page.click(".disconnectbtn");
  //     sendMessage(page, config);
  //   }, 2000);
  // }
}

export default handleConnection;

const puppeteer = require('puppeteer');
require('dotenv').config();

// this changes everytime a new chomre instance is created. run the below command in terminal to start a new instance and get the websocket endpoint

// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')

const chromeEndpoint =
  'ws://127.0.0.1:9222/devtools/browser/f571fae6-5c7a-433d-8b98-d196195f8a71';

const chromeOptions = {
  browserWSEndpoint: chromeEndpoint,
  headless: false,
  defaultViewport: null,
};

async function launchPage() {
  const browser = await puppeteer.connect(chromeOptions);
  const cashortrade = await browser.newPage();

  // await cashortrade.goto(
  //   'https://cashortrade.org/goose-tickets/?performerID=26048&filter%5B%5D=sale&keywordSearch=&eventStart=&eventEnd=&venue_states%5B%5D=NY'
  // );
  await cashortrade.goto('https://cashortrade.org/tickets');

  await cashortrade.exposeFunction('puppeteerLogMutation', () => {
    console.log('Mutation Detected: A child node has been added or removed.');
  });

  // await cashortrade.evaluate(() => {
  //   const target = document.querySelector('#postlist');
  //   const observer = new MutationObserver((mutations) => {
  //     for (const mutation of mutations) {
  //       if (mutation.type === 'childList') {
  //         puppeteerLogMutation();
  //         console.log(mutation);
  //       }
  //     }
  //   });
  //   observer.observe(target, { childList: true });
  // });
  // getPost(cashortrade);
}

async function getPost(cashortrade) {
  const postItem = await cashortrade.$('.postItem');
  await postItem.click();

  const ticketType = await cashortrade.$('#digitalAddress0');
  await ticketType.click();

  const cardcvc = await cashortrade.$('#cardCVC');
  await cardcvc.click();
  cashortrade.keyboard.type(process.env.CVC);

  await cashortrade.waitForSelector('#reply');
  const reply = await cashortrade.$eval('#reply', (input) => {
    input.textContent =
      'Would love to bring my GF to see her first Goose show!';
  });

  const checkbox = await cashortrade.$eval(
    '#agreeToTerms',
    (check) => (check.checked = true)
  );

  const submitBtn = await cashortrade.$('.FL_commit_to_buy');
  await submitBtn.click();

  const confirmBtn = await cashortrade.$('#modal-btn-yes');
  await cashortrade.waitForTimeout(500);
  confirmBtn.click();
}

launchPage();

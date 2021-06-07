const puppeteer = require('puppeteer')

const contractNumber = '0xe74dc43867e0cbeb208f1a012fc60dcbbf0e3044'
// const contractNumber = '1inch'
const amountEth = '0.09'
const mnemonic = 'claim history describe park bunker asthma idea base globe window sweet lava'
const password = 'ultraboss'

const extensionPath = 'C:\\code\\external\\token-bot\\metamask-chrome'
//const extensionPath = 'D:\\Documents - D\\bot\\token-bot\\metamask-chrome'


function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
 }

async function main () {
    const browser = await puppeteer.launch({
        headless: false,
        // change those paths to reflect the proper ones on your machine
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ]
    })
    let page = await browser.newPage()


    await delay(2000)
    // Metamask page should be loaded and asking for wallet info

    // Close all the empty tabs, leave only Metamask open to avoid confussion
    let pages = await browser.pages();
    for(let i = 0; i < pages.length; i++){
        if(pages[i].url() == "about:blank"){
            await pages[i].close()
        }
        else{
            page = pages[i]
        }
    }

    // Extract the metamask extension ID from the URL
    console.log(page.url())
    var extensionId = page.url()
                        .split('chrome-extension://')[1]
                        .split('/home.html')[0]

    // We have only Metamask page left in the browser, now we need to add a wallet
    let buttonElement = await page.waitForSelector("div.welcome-page > button")
    await buttonElement.click()

    // Click on import wallet
    let alreadyHaveWalletButtonElement = await page.waitForSelector("button")
    let value = await page.evaluate(el => el.textContent, alreadyHaveWalletButtonElement)

    if(value != "Import wallet"){
        console.log("Problem logging into Metamask...")
        return null
    }
    await alreadyHaveWalletButtonElement.click()

    // Click on Agree, because we are helpful people. This is the way of the crypto-samurai
    let agreeButtonElement = await page.waitForSelector('button[data-testid="page-container-footer-next"]')
    await agreeButtonElement.click()

    // We need to give them our secrets
    let mnemonicPhraseInputFieldSelctor = 'input[placeholder="Paste Secret Recovery Phrase from clipboard"]'
    let passwordFieldSelector = 'input[autocomplete="new-password"]'
    let confirmPasswordFieldSelector = 'input[autocomplete="confirm-password"]'

    await page.waitForSelector(mnemonicPhraseInputFieldSelctor)
    await page.type(mnemonicPhraseInputFieldSelctor, mnemonic)
    await page.type(passwordFieldSelector, password)
    await page.type(confirmPasswordFieldSelector, password)

    // Tick the text box that we have read the terms and bla bla
    let termsCheckboxElement = await page.waitForSelector('div.first-time-flow__checkbox.first-time-flow__terms')
    await termsCheckboxElement.click()

    // Click on the Import button
    let importButtonElement = await page.waitForSelector('button.btn-primary.first-time-flow__button')
    await importButtonElement.click()

    // You would think this would do but for some reason the page just hansg on loading forever, we need to force another page to open
    await page.goto(`chrome-extension://${extensionId}/home.html#initialize/unlock`)
    await page.goto(`chrome-extension://${extensionId}/home.html#initialize/unlock`)
    await delay(500)

    // We need to type in our password again
    let currentPasswordFieldSelector = 'input[autocomplete="current-password"]'
    await page.type(currentPasswordFieldSelector, password);

    let unlockButtonElement = await page.waitForSelector("button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedSizeLarge.MuiButton-sizeLarge.MuiButton-fullWidth")
    await unlockButtonElement.click()

    // Click next on this screen
    let nextButtonElement = await page.waitForSelector("button.button.btn-primary")
    await nextButtonElement.click()

    // Click on Remind me Later
    let remindMeLaterButtonElement = await page.waitForSelector("button.btn-secondary.first-time-flow__button")
    value = await page.evaluate(el => el.textContent, remindMeLaterButtonElement)
    if(value != "Remind me later"){
        console.log("Problem logging into Metamask...")
        return null
    }
    await remindMeLaterButtonElement.click()

    // We can't really click inside the extension popup, but we can navigate to a new page with this URL:
    page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    let closeButtonElement = await page.waitForSelector('button[data-testid="popover-close"]')
    await closeButtonElement.click()


    // Load Uniswap page
    await page.goto('https://app.uniswap.org/#/swap')

    // input the token's name
    await (await page.waitForXPath('//*[@id="swap-currency-output"]/div/div[1]/button/span/div/span')).click()
    await page.type('#token-search-input', contractNumber)

    let tokenNameSelect = 'body > reach-portal:nth-child(8) > div:nth-child(3) > div > div > div > div > div.sc-1kykgp9-0.gKIpUW > div > div > div > div.sc-kpOJdX.iVdpDv.css-1a92al5'
    await page.waitForSelector(tokenNameSelect)
    let tokenElement = await page.$(tokenNameSelect)
    let tokenName = await page.evaluate(el => el.textContent, tokenElement)
    console.log('Contract number:',contractNumber)

    // Import token selection
    await delay(2000)
    const importBtn = '/html/body/reach-portal[1]/div[3]/div/div/div/div/div[3]/div/button'
    let importButton = await page.waitForXPath(importBtn)
    console.log('import button found')
    await importButton.click()

    const confImportBtn = '/html/body/reach-portal/div[3]/div/div/div/div/div[3]/button'
    await (await page.waitForXPath(confImportBtn)).click()
    console.log(tokenName,'Imported')

    // input token amount in Eth
    const ethAmountElement = await page.waitForSelector("div#swap-currency-input")
    // issue entering ETH purchase amount. solved by adding SloMo:7. cannot be faster than that
    await delay(500)
    await ethAmountElement.click()
    await delay(500)
    await page.keyboard.type(amountEth);
    // await page.type(ethAmountElement, amountEth)
    // displays the amount bought in Dollars
    const amountEthSelector = '#swap-currency-input > div > div > div > div > span'

    await page.waitForSelector(amountEthSelector)
    let ethToDollars = await page.$(amountEthSelector)
    let ethValueInDollars = await page.evaluate(el => el.textContent, ethToDollars)
    console.log('ETH',amountEth,'= $',ethValueInDollars)

    // Time to connect a wallet
    let connectWalletButtonElement = await page.waitForSelector("button.sc-htpNat.jkjxPR.fwrjc2-0.fwrjc2-2.gTSEpC")
    await connectWalletButtonElement.click()

    // Choose Metamask
    let connectMetamaskButtonElement = await page.waitForSelector("button#connect-METAMASK")
    await connectMetamaskButtonElement.click()

    // We need to open the Metamask popup page
    page = await browser.newPage()
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Click on Next button
    let buttonNextElement = await page.waitForSelector("button.button.btn-primary")
    value = await page.evaluate(el => el.textContent, buttonNextElement)
    if(value != "Next"){
        console.log("Problem logging into Metamask...")
        return null
    }
    await buttonNextElement.click()

    await delay(1000)

    let buttonConnectElement = await page.waitForSelector("button.button.btn-primary")
    value = await page.evaluate(el => el.textContent, buttonConnectElement)
    if(value != "Connect"){
        console.log("Problem logging into Metamask...")
        return null
    }
    await buttonConnectElement.click()

    await delay(1000)

    // Close all tabs, except UniSwap
    pages = await browser.pages();
    for(let i = 0; i < pages.length; i++){
        if(pages[i].url() != "https://app.uniswap.org/#/swap"){
            await pages[i].close()
        }
        else{
            page = pages[i]
        }
    }

    console.log(1)

    // displays amount of new token bought
    // const newTokenAmountSelector = '#swap-currency-output > div > div.sc-33m4yg-4.hPbfqi > input'
    // const newTokenDollarSelector = '#swap-currency-output > div > div.sc-33m4yg-5.sc-33m4yg-6.dyYDN > div > div.sc-kpOJdX.jLZfGp.css-djrxae > span.sc-19p08fx-0.cszVKF'
    // let newTokenToDollars = await page.$(newTokenDollarSelector)
    // let newTokenAmount = await page.evaluate(el => el.textContent, newTokenAmountSelector)
    // let newTokenValueInDollars = await page.evaluate(el => el.textContent, newTokenToDollars)
    // console.log('NewToken',newTokenAmount,'= $',newTokenValueInDollars)

    //await browser.close()
}

main()
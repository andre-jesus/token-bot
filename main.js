const puppeteer = require('puppeteer')

const contractNumber = '0xe74dc43867e0cbeb208f1a012fc60dcbbf0e3044'
const amountEth = '0.09'

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }

async function main () {
    const browser = await puppeteer.launch({ 
        headless: false, 
        slowMo: 10,
        // change those paths to reflect the proper ones on your machine
        args: [
            '--disable-extensions-except=C:\\code\\external\\token-bot\\metamask-chrome',
            '--load-extension=C:\\code\\external\\token-bot\\metamask-chrome',
          ]
    })
    let page = await browser.newPage()


    await delay(4000)
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
    let mnemonic = 'claim history describe park bunker asthma idea base globe window sweet lava'
    let password = 'ultraboss'
    let mnemonicPhraseInputFieldSelctor = 'input[placeholder="Paste Secret Recovery Phrase from clipboard"]'
    let passwordFieldSelector = 'input[autocomplete="new-password"]'
    let confirmPasswordFieldSelector = 'input[autocomplete="confirm-password"]'

    await page.type(mnemonicPhraseInputFieldSelctor, mnemonic);
    await page.type(passwordFieldSelector, password);
    await page.type(confirmPasswordFieldSelector, password);

    // Tick the text box that we have read the terms and bla bla
    let termsCheckboxElement = await page.waitForSelector('div.first-time-flow__checkbox.first-time-flow__terms')
    await termsCheckboxElement.click()

    // Click on the Import button
    let importButtonElement = await page.waitForSelector('button.btn-primary.first-time-flow__button')
    await importButtonElement.click()

    // You would think this would do but for some reason the page just hansg on loading forever, we need to force another page to open
    await page.goto("chrome-extension://cciombapoodpmkhfahobnfpmnhllfbal/home.html#initialize/unlock")
    await page.goto("chrome-extension://cciombapoodpmkhfahobnfpmnhllfbal/home.html#initialize/unlock")
    await delay(4000)

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


    //load Uniswap page
    await page.goto('https://app.uniswap.org/#/swap')

    // input the token's name 
    await (await page.waitForXPath('//*[@id="swap-currency-output"]/div/div[1]/button/span/div/span')).click()
    await page.type('#token-search-input', contractNumber)

    let tokenNameSelect = 'body > reach-portal:nth-child(7) > div:nth-child(3) > div > div > div > div > div.sc-1kykgp9-0.gKIpUW > div > div.sc-1kykgp9-2.cJUoUv > div.sc-htpNat.nrd8cx-0.nrd8cx-3.iCCuvf > div.sc-kpOJdX.dxMztp.css-1apwtoq > div'
    await page.waitForSelector(tokenNameSelect)
    let tokenElement = await page.$(tokenNameSelect)
    let tokenName = await page.evaluate(el => el.textContent, tokenElement)
    console.log('Contract number:',contractNumber)

    // Import token selection 
    const importBtn = '/html/body/reach-portal[1]/div[3]/div/div/div/div/div[3]/div/button'
    await (await page.waitForXPath(importBtn)).click()
    const confImportBtn = '/html/body/reach-portal/div[3]/div/div/div/div/div[3]/button'
    await (await page.waitForXPath(confImportBtn)).click()
    console.log(tokenName,'Imported')

    // input token amount in Eth
    const ethAmountSelector = '#swap-currency-input > div > div.sc-33m4yg-4.hPbfqi > input'
    // issue entering ETH purchase amount. solved by adding SloMo:7. cannot be faster than that
    await (await page.waitForSelector(ethAmountSelector)).click()
    await page.type(ethAmountSelector, amountEth)
    // displays the amount bought in Dollars
    const amountEthSelector = '#swap-currency-input > div > div.sc-33m4yg-5.sc-33m4yg-6.dyYDN > div > div.sc-kpOJdX.jLZfGp.css-djrxae > span'
    await page.waitForSelector(amountEthSelector)
    let ethToDollars = await page.$(amountEthSelector)
    let ethValueInDollars = await page.evaluate(el => el.textContent, ethToDollars)
    console.log('ETH',amountEth,'= $',ethValueInDollars)

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


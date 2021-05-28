const puppeteer = require('puppeteer')

const contractNumber = '0xe74dc43867e0cbeb208f1a012fc60dcbbf0e3044'
const amountEth = '0.09'


describe('First Test', () => {
    it('Should launch the browser', async function() {

        //const token = ''

        const browser = await puppeteer.launch({ headless: false, slowMo: 10})
        const page = await browser.newPage()

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
        console.log({tokenName},'Imported')

        // input token amount in Eth
        const ethAmountSelector = '#swap-currency-input > div > div.sc-33m4yg-4.hPbfqi > input'
        // issue entering ETH purchase amount. solved by adding SloMo:7. cannot be faster than that
        await page.type(ethAmountSelector, amountEth)
        // displays the amount bought in Dollars
        const amountEthSelector = '#swap-currency-input > div > div.sc-33m4yg-5.sc-33m4yg-6.dyYDN > div > div.sc-kpOJdX.jLZfGp.css-djrxae > span'
        await page.waitForSelector(amountEthSelector)
        let ethToDollars = await page.$(amountEthSelector)
        let ethValueInDollars = await page.evaluate(el => el.textContent, ethToDollars)
        console.log('ETH',amountEth,'= $',ethValueInDollars)

        // displays amount of new token bought
        const newTokenAmountSelector = '#swap-currency-output > div > div.sc-33m4yg-4.hPbfqi > input' 
        const newTokenDollarSelector = '#swap-currency-output > div > div.sc-33m4yg-5.sc-33m4yg-6.dyYDN > div > div.sc-kpOJdX.jLZfGp.css-djrxae > span.sc-19p08fx-0.cszVKF'
        let newTokenToDollars = await page.$(newTokenDollarSelector)
        let newTokenAmount = await page.evaluate(el => el.textContent, newTokenAmountSelector)
        let newTokenValueInDollars = await page.evaluate(el => el.textContent, newTokenToDollars)
        console.log('NewToken',newTokenAmount,'= $',newTokenValueInDollars)


    

        await browser.close()
    })
})


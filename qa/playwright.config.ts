import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests', timeout:45000, expect:{timeout:12000}, workers:1, retries:0,
  reporter:[['list'],['html',{outputFolder:'reports/playwright',open:'never'}],['json',{outputFile:'reports/results.json'}]],
  use:{baseURL:'http://127.0.0.1:5234',trace:'retain-on-failure',screenshot:'only-on-failure'},
  projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Pixel 7']}}],
  webServer:{command:'node server.mjs',url:'http://127.0.0.1:5234',reuseExistingServer:!process.env.CI,timeout:15000},
});

module.exports={ci:{
 collect:{url:['http://127.0.0.1:5234/'],startServerCommand:'node server.mjs',startServerReadyPattern:'QA server',numberOfRuns:3,settings:{maxWaitForLoad:15000,chromeFlags:'--headless --no-sandbox --disable-dev-shm-usage'}},
 assert:{assertions:{'categories:performance':['warn',{minScore:0.8}],'categories:accessibility':['warn',{minScore:0.9}],'largest-contentful-paint':['warn',{maxNumericValue:4000}],'cumulative-layout-shift':['warn',{maxNumericValue:0.1}]}},
 upload:{target:'filesystem',outputDir:'reports/lighthouse'}
}};

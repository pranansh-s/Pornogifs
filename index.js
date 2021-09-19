const { Client } = require('discord.js');
const request = require('request-promise');
const cheerio = require('cheerio');
require('dotenv').config();

const client = new Client();

client.on('ready', () => {
    console.log('bot ready');
});

function searchPage(mssg, search, maxN){
    var page = Math.floor(Math.random() * maxN) + 1;
    request(`https://porngipfy.com/page/${page}/?s=${search}`, (err, response, html) => {                
        if(!err && response.statusCode == 200){ 
            const $ = cheerio.load(html);
            var nGifs = $('.thumb-image').length;
            var randomGif = Math.floor(Math.random() * nGifs);
            mssg.channel.send($('.thumb-image').eq(randomGif).find('img').attr('data-gif'));
        }
    }).catch((error) => {
        searchPage(mssg, search, page - 1);
    });    
}

client.on('message', async(mssg) => {
    if(mssg.content.startsWith('?pg ')){
        if(mssg.content.substr(4) == 'help'){
            mssg.channel.send("Just add a search query after `?pg `.");
        }
        else{
            var search = mssg.content.substr(4).trim().toLowerCase().replace(' ', '+');
            request(`https://porngipfy.com/page/1/?s=${search}`, (err, response, html) => {                
                if(!err && response.statusCode == 200){   
                    const $ = cheerio.load(html);
                    if($('.slogan').find('h2').text() == "Nothing found. Check out these nasty gifs:Trending Tags"){
                        mssg.channel.send(`No gifs found with **${search}**`);
                    }
                    else{
                        searchPage(mssg, search, 100);
                    }
                }
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
import Slackbots from 'slackbots';
import rp from 'request-promise';

let bot;

function lookupUserById(id) {
  return bot.getUsers().then(data => {
    return data.members.filter(u => u.id === id)[0];
  });
}

function lookupChannelById(id) {
  return bot._api('channels.info', {
    channel: id
  });
}

function downloadFile(url) {
  return rp({
    url: url,
    headers: {
      'Authorization': `Bearer ${bot.token}`
    }
  });
}

function reply(channel, msg) {
  if (typeof msg === 'string') {
    msg = { text: msg };
  }

  return bot.postMessage(channel, msg.text, {
    ...msg,
    icon_url: 'https://s3.amazonaws.com/vddf/logo48.png'
  });
}

export default function(app) {
  const config = app.config;

  bot = new Slackbots({
    token: config.slack.token,
    name: config.slack.name
  });

  bot.on('start', () => {
    console.log('Slackbot ready');
  });

  bot.on('message', (data) => {
    if (data.type === 'message') {
      if (data.subtype === 'bot_message') {
        // ignore
      } else if (data.subtype === 'file_share') {
        const mimeType = data.file.mimetype;

        if (data.file.size >= 2 * 1024 * 1024) {
          reply(data.channel, 'Sorry, I can only work with small file for now :frowning:.');
        } else if (mimeType === 'text/csv' || mimeType === 'text/csv') {
          reply(data.channel, 'I am working on it, will send you back shortly!');

          downloadFile(data.file.url_private)
            .then(csv => {
              return app.manager.loadFromCsv(csv, 'slack', {
                title: data.file.title
              });
            })
            .then(vddf => {
              // since this is new, render will just show a table
              // return app.manager.renderer.render(vddf)
              //   .then(() => vddf);

              return vddf;
            })
            .then(vddf => {
              reply(data.channel, {
                text: 'Here is your visual-ddf',
                attachments: [
                  {
                    title: vddf.title,
                    title_link: config.baseUrl + '/vddf/' + vddf.uuid,
                    image_url: config.baseUrl + '/vddf/' + vddf.uuid + '.png'
                  }
                ]
              });
            })
            .catch(err => {
              reply(data.channel, 'Oops, I can\'t convert that file. Please try another file.');
              console.log(err.stack);
            });

          // TODO: create a vddf out of it
        } else {
          reply(data.channel, 'Sorry, i don\'t understand your file format. Please try CSV file.');
        }
      } else if (!data.subtype) {
        // only support direct message for now
        if (data.channel[0] !== 'D') {
          return;
        }

        let msg = {};

        if (data.text === 'help') {
          msg.text = 'Send me a CSV file, i will create a chart for you!';
        } else if (data.text === 'hello') {
          msg.text = 'Hello there!';
        }

        if (!msg.text) {
          msg.text = 'Sorry, i don\'t understand your command. Please try help';
        }

        reply(data.channel, msg);
      }
      //  else {
      //   console.log('message', data);
      // }
    }
  });

  return bot;
}

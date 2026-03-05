const { Expo } = require('expo-server-sdk');
let expo = new Expo();

const sendNotification = async (pushToken, title, body, data = {}) => {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

    const messages = [{
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
    }];

    try {
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];

        for (let chunk of chunks) {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }

        return tickets;
    } catch (error) {
        console.error('Error sending push notification', error);
    }
};

module.exports = {
    sendNotification,
};

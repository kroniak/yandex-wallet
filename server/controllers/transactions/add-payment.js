const addTransaction = require('../add-transaction-method');
const bot = require('../../libs/bot');

module.exports = async ctx => {
	const {id} = ctx.params;

	const {phone, amount} = ctx.request.body;
	if (!phone || !amount)
		ctx.throw(400, 'properties required');

	const card = await ctx.cards.get(id);
	if (!card) ctx.throw(404, `card with id=${id} not found`);

	const transaction = {
		cardId: id,
		type: 'paymentMobile',
		data: phone,
		time: Math.floor(Date.now() / 1000),
		sum: Number(amount) > 0 ? Number(amount) * -1 : Number(amount)
	};

	await addTransaction(transaction, ctx, card);

	ctx.body = {
		status: 'success'
	}

	ctx.status = 201;

	if (ctx.isTelegramPayment) {
		return 201;
	} else {
		const notificationParams = {
			type: transaction.type,
			user: ctx.user,
			amount,
			phone,
			card
		};
	
		bot.sendNotification(notificationParams);
	}
};

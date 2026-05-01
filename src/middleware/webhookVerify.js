const verifyWebhook = (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('[WEBHOOK] Verify attempt:', { mode, token });

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('[WEBHOOK] Verified successfully');
    return res.status(200).send(challenge);
  }

  console.warn('[WEBHOOK] Verification failed — token mismatch');
  return res.sendStatus(403);
};

module.exports = { verifyWebhook };
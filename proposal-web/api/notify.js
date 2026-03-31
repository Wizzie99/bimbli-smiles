const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  // Allow CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { packageName, packagePrice, packageDuration, timestamp } = req.body || {};

  if (!packageName) return res.status(400).json({ error: 'Missing package data' });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const dateStr = new Date(timestamp || Date.now()).toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });

    await transporter.sendMail({
      from: `"Bimbli Smiles Proposal" <${process.env.GMAIL_USER}>`,
      to: 'Kocotozaj21@gmail.com',
      subject: `📋 New Package Selected — ${packageName} (${packagePrice})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #FDFCF9; margin: 0; padding: 32px; color: #1A1A1A; }
            .card { background: #fff; border: 1px solid #E0E0E0; border-radius: 16px; padding: 40px; max-width: 560px; margin: 0 auto; }
            .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #1574D2; margin-bottom: 6px; }
            h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px 0; letter-spacing: -0.03em; }
            .pill { display: inline-block; background: #EEF5FF; color: #1574D2; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 40px; margin-bottom: 24px; }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F0F0F0; }
            .row:last-child { border-bottom: none; }
            .key { font-size: 13px; color: #666; }
            .val { font-size: 13px; font-weight: 600; }
            .footer { margin-top: 28px; font-size: 12px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="label">Bimbli Smiles — New Submission</div>
            <h1>Package Selected</h1>
            <div class="pill">${packageName} — ${packageDuration}</div>
            <div class="row"><span class="key">Package</span><span class="val">${packageName}</span></div>
            <div class="row"><span class="key">Price</span><span class="val">${packagePrice}</span></div>
            <div class="row"><span class="key">Duration</span><span class="val">${packageDuration}</span></div>
            <div class="row"><span class="key">Submitted at</span><span class="val">${dateStr}</span></div>
            <div class="footer">Sent automatically from your Bimbli Smiles proposal page.</div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
};

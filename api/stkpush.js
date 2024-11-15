import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { phone, amount } = req.body;

        try {
            // Step 1: Obtain an OAuth token
            const auth = Buffer.from(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`).toString('base64');
            const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
                headers: { Authorization: `Basic ${auth}` },
            });
            const token = tokenResponse.data.access_token;

            // Step 2: Generate a timestamp and password for STK push
            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, -3);
            const password = Buffer.from(`${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`).toString('base64');

            // Step 3: Make the STK push request
            const response = await axios.post(
                'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
                {
                    BusinessShortCode: process.env.SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: amount,
                    PartyA: phone,
                    PartyB: process.env.SHORTCODE,
                    PhoneNumber: phone,
                    CallBackURL: process.env.CALLBACK_URL,
                    AccountReference: 'Ref001',
                    TransactionDesc: 'Payment for Goods',
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            res.status(200).json(response.data);
        } catch (error) {
            res.status(500).json({ message: 'Failed to initiate payment', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}

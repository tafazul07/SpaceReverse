const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const { Pool } = require('pg');
const OpenAI = require('openai');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false
});
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false
});
app.use('/api', apiLimiter);

const pool = new Pool({
    connectionString: process.env.DATA_CONNECTION
});


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


app.post('/api/chat', chatLimiter, async (req, res) => {
    const { sessionId, message } = req.body;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId || '') ||
        typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
        return res.status(400).json({ error: 'A valid sessionId and message up to 2000 characters are required.' });
    }
    req.body.message = message.trim();

    try {
        // 1. Get or create chat session
        let sessionResult = await pool.query(
            'SELECT * FROM chat_sessions WHERE session_id = $1',
            [sessionId]
        );

        let session;
        if (sessionResult.rows.length === 0) {
            sessionResult = await pool.query(
                'INSERT INTO chat_sessions (session_id, messages, booking_data) VALUES ($1, $2, $3) RETURNING *',
                [sessionId, JSON.stringify([]), JSON.stringify({})]
            );
        }
        session = sessionResult.rows[0];

        // 2. Fetch available data from DB to give AI context
        const halls = await pool.query('SELECT * FROM halls');
        const menus = await pool.query('SELECT * FROM menu_packages');

        // 3. Build system prompt with your business data
        const systemPrompt = `You are a wedding hall booking assistant. Help users book halls and choose menus.

AVAILABLE HALLS:
${halls.rows.map(h => `- ${h.name}: Capacity ${h.capacity}, Price Rs.${h.price_per_day}/day, ${h.description}`).join('\n')}

AVAILABLE MENU PACKAGES:
${menus.rows.map(m => `- ${m.name}: ${m.cuisine_type}, Rs.${m.price_per_head}/head, for ${m.min_guests}-${m.max_guests} guests, Items: ${JSON.parse(m.items).join(', ')}`).join('\n')}

RULES:
- Always ask for: event date, number of guests, preferred cuisine.
- Suggest halls based on guest count.
- Suggest menu packages that fit the guest count and budget.
- If they mention budget, calculate total cost = hall price + (menu price × guests).
- Be friendly and concise. Speak in Urdu-English mix if user does.

Current extracted booking data: ${JSON.stringify(session.booking_data)}`;

        // 4. Prepare messages
        const messages = [
            { role: 'system', content: systemPrompt },
            ...session.messages,
            { role: 'user', content: message }
        ];

        // 5. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7
        });

        const aiReply = completion.choices[0].message.content;

        // 6. Try to extract booking intent (simple keyword extraction)
        const updatedData = extractBookingData(session.booking_data, message);

        // 7. Save to DB
        const updatedMessages = [...session.messages, 
            { role: 'user', content: message },
            { role: 'assistant', content: aiReply }
        ];

        await pool.query(
            'UPDATE chat_sessions SET messages = $1, booking_data = $2 WHERE session_id = $3',
            [JSON.stringify(updatedMessages), JSON.stringify(updatedData), sessionId]
        );

        res.json({ reply: aiReply, bookingData: updatedData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

app.get('/api/menus', async(req, res, next) =>{
    try {
        const result = await pool.query('SELECT * FROM menu_packages');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
})

app.post('/api/bookings', async (req, res, next) => {
    const { customerName, customerPhone, eventDate, hallId, expectedGuests, menuPackageId, totalBudget } = req.body;
    if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.length > 100 ||
        typeof customerPhone !== 'string' || customerPhone.trim().length < 7 || customerPhone.length > 20 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(eventDate || '') ||
        !Number.isInteger(expectedGuests) || expectedGuests < 1 || expectedGuests > 10000 ||
        !Number.isInteger(hallId) || !Number.isInteger(menuPackageId) ||
        typeof totalBudget !== 'number' || !Number.isFinite(totalBudget) || totalBudget < 0) {
        return res.status(400).json({ error: 'Invalid booking details.' });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO bookings (customer_name, customer_phone, event_date, hall_id, expected_guests, menu_package_id, total_budget)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [customerName.trim(), customerPhone.trim(), eventDate, hallId, expectedGuests, menuPackageId, totalBudget]
        );
        res.json({ success: true, booking: result.rows[0] });
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
});


function extractBookingData(existing, message) {
    const data = { ...existing };
    const lower = message.toLowerCase();
    
    // Extract guest count
    const guestMatch = message.match(/(\d+)\s*(people|guests|person|attendees)/i);
    if (guestMatch) data.guests = parseInt(guestMatch[1]);
    
    // Extract date
    const dateMatch = message.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    if (dateMatch) data.date = `${dateMatch[1]} ${dateMatch[2]} 2026`;
    
    // Extract budget
    const budgetMatch = message.match(/(\d+)\s*(lakh|thousand|k)/i);
    if (budgetMatch) {
        const num = parseInt(budgetMatch[1]);
        data.budget = budgetMatch[2] === 'lakh' ? num * 100000 : num * 1000;
    }
    
    return data;
}

app.listen(process.env.PORT || 3001, ()=> console.log(`server running on port ${process.env.PORT || 3001}`));
import { useState, useEffect, useRef } from 'react';

export default function BookingChat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Assalam-o-Alaikum! Welcome to our wedding hall booking. How many guests are you expecting?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId] = useState(() => localStorage.getItem('chatSession') || crypto.randomUUID());
    const bottomRef = useRef(null);

    // Save session ID
    useEffect(() => {
        localStorage.setItem('chatSession', sessionId);
    }, [sessionId]);

    // Auto scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, message: userMsg })
            });
            
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            
            // Optional: show extracted data in console or UI
            console.log('Extracted booking data:', data.bookingData);
            
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, mein abhi respond nahi kar sakta. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ background: '#8B1538', color: 'white', padding: '16px', textAlign: 'center' }}>
                <h3>🤖 Wedding Booking Assistant</h3>
            </div>
            
            <div style={{ height: '400px', overflowY: 'auto', padding: '16px', background: '#f9f9f9' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        marginBottom: '12px',
                        textAlign: msg.role === 'user' ? 'right' : 'left'
                    }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? '#8B1538' : 'white',
                            color: msg.role === 'user' ? 'white' : '#333',
                            border: msg.role === 'user' ? 'none' : '1px solid #ddd',
                            maxWidth: '80%'
                        }}>
                            {msg.content}
                        </span>
                    </div>
                ))}
                {loading && <div style={{ color: '#666', fontSize: '14px' }}>Typing...</div>}
                <div ref={bottomRef} />
            </div>
            
            <div style={{ display: 'flex', padding: '12px', borderTop: '1px solid #ddd', background: 'white' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type here... (e.g., '200 guests, 15 Dec, desi menu')"
                    style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginRight: '8px' }}
                />
                <button 
                    onClick={sendMessage}
                    disabled={loading}
                    style={{ padding: '10px 20px', background: '#8B1538', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}
import { useState } from 'react';
import './App.css';

const halls = [
    {
        name: 'The Grand Pavilion',
        detail: 'Up to 500 guests',
        price: 'Rs. 180,000',
        image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=85',
        tag: 'Most loved'
    },
    {
        name: 'The Garden Terrace',
        detail: 'Up to 250 guests',
        price: 'Rs. 110,000',
        image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=85',
        tag: 'Open air'
    },
    {
        name: 'The Ivory Room',
        detail: 'Up to 120 guests',
        price: 'Rs. 75,000',
        image: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1000&q=85',
        tag: 'Intimate'
    }
];

const menus = [
    { name: 'The Lahore Table', type: 'Desi feast', price: 'Rs. 1,800 / guest', items: 'Karahi · Biryani · Seekh kebab' },
    { name: 'Garden & Grain', type: 'Contemporary', price: 'Rs. 2,200 / guest', items: 'Seasonal salads · Roast · Desserts' },
    { name: 'The Green Table', type: 'Vegetarian', price: 'Rs. 1,400 / guest', items: 'Paneer · Dal makhani · Fresh naan' }
];

function App() {
    const [selectedHall, setSelectedHall] = useState(halls[0].name);
    const [submitted, setSubmitted] = useState(false);

    const submitBooking = async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const details = {
            customerName: form.get('name'),
            customerPhone: form.get('phone'),
            eventDate: form.get('date'),
            hallId: Number(form.get('hallId') || 1),
            expectedGuests: Number(form.get('guests')),
            menuPackageId: 1,
            totalBudget: Number(form.get('budget')) || 0
        };

        try {
            const response = await fetch('http://localhost:4000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(details)
            });
            if (!response.ok) throw new Error('Booking request failed');
            setSubmitted(true);
        } catch {
            setSubmitted(true);
        }
    };

    return (
        <div className="site-shell">
            <header className="topbar">
                <a className="brand" href="#top" aria-label="SpaceReverse home"><span>SR</span> SpaceReverse</a>
                <nav className="nav-links" aria-label="Main navigation">
                    <a href="#spaces">Spaces</a>
                    <a href="#menus">Menus</a>
                    <a href="#story">Our approach</a>
                </nav>
                <a className="button button-small" href="#book">Plan your day <span>↗</span></a>
            </header>

            <main id="top">
                <section className="hero">
                    <div className="hero-copy">
                        <p className="eyebrow">Events, made personal</p>
                        <h1>A beautiful beginning to your <em>forever.</em></h1>
                        <p className="hero-intro">Thoughtful spaces, generous tables, and a team that remembers every little thing. Celebrate your wedding, your way.</p>
                        <div className="hero-actions">
                            <a className="button" href="#book">Check availability <span>↗</span></a>
                            <a className="text-link" href="#spaces">Explore the spaces <span>↓</span></a>
                        </div>
                        <div className="hero-proof"><span className="proof-avatars">A&nbsp; S&nbsp; M</span><span><strong>4.9/5</strong> from 240+ celebrations</span></div>
                    </div>
                    <div className="hero-image"><div className="image-note"><span>01</span><strong>Made for the moments<br />you keep forever.</strong></div></div>
                </section>

                <section className="intro-strip" id="story">
                    <p className="eyebrow">The SpaceReverse promise</p>
                    <h2>Not just a venue.<br /><em>Your people, in their place.</em></h2>
                    <p>From the first cup of tea to the last dance, we take care of the details so you can stay in the moment.</p>
                </section>

                <section className="section" id="spaces">
                    <div className="section-heading"><div><p className="eyebrow">Find your setting</p><h2>Spaces with a point of view.</h2></div><a className="text-link" href="#book">See availability <span>↗</span></a></div>
                    <div className="hall-grid">{halls.map((hall, index) => <article className="hall-card" key={hall.name}>
                        <div className="hall-image" style={{ backgroundImage: `url(${hall.image})` }}><span className="card-tag">{hall.tag}</span><span className="card-number">0{index + 1}</span></div>
                        <div className="hall-info"><div><h3>{hall.name}</h3><p>{hall.detail}</p></div><strong>{hall.price}<small> / day</small></strong></div>
                    </article>)}</div>
                </section>

                <section className="split-section" id="menus">
                    <div className="split-image"></div>
                    <div className="split-copy"><p className="eyebrow">The table matters</p><h2>Food worth gathering for.</h2><p>Our menus are rooted in generous Pakistani hospitality, then given a little room to surprise you. Choose a favourite or let our chefs build something just for your table.</p><a className="button button-dark" href="#book">Browse menu ideas <span>↗</span></a></div>
                </section>

                <section className="section menu-section"><div className="section-heading"><div><p className="eyebrow">From our kitchen</p><h2>Three ways to feast.</h2></div></div><div className="menu-grid">{menus.map(menu => <article className="menu-card" key={menu.name}><span className="menu-mark">✦</span><p className="menu-type">{menu.type}</p><h3>{menu.name}</h3><p>{menu.items}</p><strong>{menu.price}</strong></article>)}</div></section>

                <section className="booking-section" id="book"><div className="booking-heading"><p className="eyebrow">Let’s make a plan</p><h2>Tell us about<br /><em>your day.</em></h2><p>Share a few details and our events team will be in touch within one working day.</p><div className="contact-line"><span>✦</span><div><strong>Prefer to talk?</strong><br />+92 300 123 4567</div></div></div><form className="booking-form" onSubmit={submitBooking}><div className="form-row"><label>Your name<input name="name" required placeholder="e.g. Ayesha Khan" /></label><label>Phone number<input name="phone" required placeholder="+92 300 0000000" /></label></div><div className="form-row"><label>Preferred date<input name="date" type="date" required /></label><label>Guest count<input name="guests" type="number" min="1" required placeholder="200" /></label></div><label>Choose a space<select name="hallId" onChange={(event) => setSelectedHall(halls[Number(event.target.value) - 1]?.name || halls[0].name)}>{halls.map((hall, index) => <option value={index + 1} key={hall.name}>{hall.name}</option>)}</select></label><p className="selected-note">You’re looking at <strong>{selectedHall}</strong>.</p><label>Estimated budget <span className="optional">optional</span><input name="budget" type="number" min="0" placeholder="Rs. 250000" /></label>{submitted ? <div className="success-message">Thank you. Your request is with our events team.</div> : <button className="button button-submit" type="submit">Request a private tour <span>↗</span></button>}</form></section>
            </main>
            <footer><a className="brand" href="#top"><span>SR</span> SpaceReverse</a><p>Good days, thoughtfully held.</p><p>© 2026 SpaceReverse</p></footer>
        </div>
    );
}

export default App;
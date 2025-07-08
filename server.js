const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

let dbFile = path.join(__dirname, 'data.json');
let db = { users: [], news: [] };

// اگر فایل دیتا وجود داشت، بخوان
if (fs.existsSync(dbFile)) {
    db = JSON.parse(fs.readFileSync(dbFile));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

app.set('view engine', 'ejs');

// صفحه ورود و ثبت‌نام
app.get('/', (req, res) => {
    res.render('index', { error: null });
});

// ورود
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = user;
        res.redirect('/news');
    } else {
        res.render('index', { error: 'اطلاعات نادرست است' });
    }
});

// ثبت‌نام
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (db.users.find(u => u.username === username)) {
        res.render('index', { error: 'این نام کاربری قبلاً ثبت شده' });
        return;
    }
    db.users.push({ username, password });
    fs.writeFileSync(dbFile, JSON.stringify(db));
    res.redirect('/');
});

// نمایش اخبار
app.get('/news', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.render('news', { news: db.news });
});

app.listen(PORT, () => console.log('Server running on port', PORT));
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_TOKEN = "@404"; // Token yang valid

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// === FRONTEND (Halaman Token) ===
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Token Login</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Arial', sans-serif; }
                body { background: linear-gradient(135deg, #1e1e2e, #23232d); color: #fff; text-align: center; display: flex; justify-content: center; align-items: center; height: 100vh; }
                .container { background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 12px; backdrop-filter: blur(10px); width: 350px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); }
                h2 { font-size: 22px; margin-bottom: 15px; }
                input, button { padding: 12px; margin: 8px 0; border: none; border-radius: 8px; font-size: 16px; outline: none; width: 100%; text-align: center; }
                input { background: rgba(255, 255, 255, 0.2); color: #fff; }
                input::placeholder { color: rgba(255, 255, 255, 0.6); }
                button { background: #00a8ff; color: #fff; font-weight: bold; cursor: pointer; transition: 0.3s; }
                button:hover { background: #0097e6; transform: scale(1.05); }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Masukkan Token</h2>
                <form action="/validate-token" method="POST">
                    <input type="text" name="token" placeholder="Masukkan Token" required />
                    <button type="submit">Validasi Token</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// === Validasi Token ===
app.post("/validate-token", (req, res) => {
    const { token } = req.body;
    if (token === VALID_TOKEN) {
        return res.redirect("/home");
    } else {
        return res.send("<h2>Token Invalid!</h2><p>Silakan coba lagi.</p><a href='/'>Kembali</a>");
    }
});

// === Halaman Home ===
app.get("/home", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Menu Utama</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; font-family: Arial, sans-serif; }
                body { background: #1e1e2e; color: white; text-align: center; }
                nav { background: black; padding: 15px; text-align: left; }
                nav a { color: white; text-decoration: none; font-size: 18px; margin-right: 20px; padding: 10px; transition: 0.3s; }
                nav a:hover { background: rgba(255, 255, 255, 0.2); border-radius: 5px; }
                .container { margin-top: 50px; padding: 20px; }
                input, button { padding: 10px; margin: 10px; font-size: 16px; border: none; border-radius: 8px; }
                input { background: rgba(255, 255, 255, 0.1); color: white; text-align: center; }
                button { background: #00a8ff; color: white; font-weight: bold; cursor: pointer; }
                button:hover { background: #0097e6; }
            </style>
        </head>
        <body>
            <nav>
                <a href="#" onclick="showHome()">Home</a>
                <a href="#" onclick="showPairing()">Pairing</a>
            </nav>
            <div class="container">
                <div id="home">
                    <h2>Selamat datang di @YanOfficial</h2>
                    <p>Pilih menu di atas.</p>
                </div>
                <div id="pairing-form" style="display: none;">
                    <h2>Pairing WhatsApp</h2>
                    <input type="text" id="nomor" placeholder="Masukkan Nomor WA" />
                    <input type="number" id="jumlah" placeholder="Jumlah Pairing" />
                    <button onclick="startPairing()">Mulai Pairing</button>
                    <div id="pairing-result"></div>
                </div>
            </div>
            <script>
                function showHome() {
                    document.getElementById("home").style.display = "block";
                    document.getElementById("pairing-form").style.display = "none";
                }
                function showPairing() {
                    document.getElementById("home").style.display = "none";
                    document.getElementById("pairing-form").style.display = "block";
                }
                function startPairing() {
                    const nomor = document.getElementById("nomor").value;
                    const jumlah = document.getElementById("jumlah").value;
                    if (!nomor || !jumlah) return alert("Nomor dan jumlah harus diisi!");
                    fetch(\`/pairing?nomor=\${nomor}&jumlah=\${jumlah}\`)
                        .then(res => res.json())
                        .then(data => {
                            let resultHTML = "<h3>Pairing Codes:</h3>";
                            data.codes.forEach(code => { resultHTML += "<p>" + code + "</p>"; });
                            document.getElementById("pairing-result").innerHTML = resultHTML;
                        })
                        .catch(err => alert("Error saat pairing: " + err.message));
                }
            </script>
        </body>
        </html>
    `);
});

// === API Pairing ===
async function XeonProject(nomorTarget, xeonCodes) {
    try {
        const { state } = await useMultiFileAuthState("./69/session");
        const XeonBotInc = makeWASocket({ logger: pino({ level: "info" }), auth: state, browser: ["Ubuntu", "Chrome", "20.0.04"] });

        console.log("Requesting pairing codes...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        let codes = [];
        for (let i = 0; i < xeonCodes; i++) {
            try {
                let code = await XeonBotInc.requestPairingCode(nomorTarget);
                codes.push(code?.match(/.{1,4}/g)?.join("-") || code);
            } catch (error) { console.error("Error:", error.message); }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return codes;
    } catch (error) {
        console.error("Error in bot initialization:", error.message);
        return [];
    }
}

app.get("/pairing", async (req, res) => {
    const { nomor, jumlah } = req.query;
    if (!nomor || !jumlah) return res.status(400).json({ error: "Nomor dan jumlah diperlukan!" });
    res.json({ nomor, codes: await XeonProject(nomor, parseInt(jumlah)) });
});

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));

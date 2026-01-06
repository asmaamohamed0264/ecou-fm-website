# Ecou FM - Site Radio Online

Site web modern și simplist pentru postul de radio Ecou FM, cu player audio funcțional pentru stream-ul AzuraCast.

## Caracteristici

- 🎵 Player audio funcțional cu control play/pause și volum
- 🎨 Design modern cu gradient și animații subtile
- 📱 Responsive design optimizat pentru mobile, tablet și desktop
- ⚡ Performanță optimă - site static fără dependențe
- ♿ Accesibil - suport pentru keyboard shortcuts
- 🔄 Gestionare automată a erorilor și reconectare

## Structura Proiectului

```
.
├── index.html      # Pagina principală
├── styles.css      # Stiluri și design
├── script.js       # Logică player audio
└── README.md       # Documentație
```

## Deployment pe VPS Contabo

### Opțiunea 1: Nginx

1. **Instalează Nginx** (dacă nu este deja instalat):
```bash
sudo apt update
sudo apt install nginx -y
```

2. **Creează directorul pentru site**:
```bash
sudo mkdir -p /var/www/ecou-fm
```

3. **Copiază fișierele** în director:
```bash
sudo cp index.html styles.css script.js /var/www/ecou-fm/
```

4. **Configurează Nginx**:
```bash
sudo nano /etc/nginx/sites-available/ecou-fm
```

Adaugă următoarea configurație:
```nginx
server {
    listen 80;
    server_name domeniul-tau.com;  # Înlocuiește cu domeniul tău

    root /var/www/ecou-fm;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache pentru fișiere statice
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

5. **Activează site-ul**:
```bash
sudo ln -s /etc/nginx/sites-available/ecou-fm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

6. **Configurează SSL cu Let's Encrypt** (recomandat):
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domeniul-tau.com
```

### Opțiunea 2: Apache

1. **Instalează Apache**:
```bash
sudo apt update
sudo apt install apache2 -y
```

2. **Creează directorul pentru site**:
```bash
sudo mkdir -p /var/www/ecou-fm
```

3. **Copiază fișierele**:
```bash
sudo cp index.html styles.css script.js /var/www/ecou-fm/
sudo chown -R www-data:www-data /var/www/ecou-fm
```

4. **Configurează Apache**:
```bash
sudo nano /etc/apache2/sites-available/ecou-fm.conf
```

Adaugă configurația:
```apache
<VirtualHost *:80>
    ServerName domeniul-tau.com
    DocumentRoot /var/www/ecou-fm

    <Directory /var/www/ecou-fm>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/ecou-fm_error.log
    CustomLog ${APACHE_LOG_DIR}/ecou-fm_access.log combined
</VirtualHost>
```

5. **Activează site-ul**:
```bash
sudo a2ensite ecou-fm.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

### Opțiunea 3: Server HTTP simplu (pentru testare)

Pentru testare rapidă, poți folosi un server HTTP simplu:

**Python 3**:
```bash
python3 -m http.server 8000
```

**Node.js** (cu http-server):
```bash
npx http-server -p 8000
```

Apoi accesează `http://localhost:8000` în browser.

## Configurare Stream URL

Stream-ul este configurat în `script.js`:
```javascript
const STREAM_URL = 'http://radio-fm-azuracast-5cca97-38-242-235-54.traefik.me/public/ecou_fm';
```

Pentru a schimba URL-ul stream-ului, editează această variabilă în `script.js`.

## Personalizare

### Culori

Culorile pot fi personalizate în `styles.css` prin variabilele CSS:
```css
:root {
    --primary-gradient-start: #667eea;
    --primary-gradient-end: #764ba2;
    --bg-dark: #0a0e27;
    /* ... */
}
```

### Text și conținut

Editează textul în `index.html`:
- Numele radio-ului: `<h1 class="logo">ECOU FM</h1>`
- Descrierea: `<p class="description">...</p>`

## Keyboard Shortcuts

- **Spacebar** - Play/Pause
- **Arrow Up** - Crește volumul cu 5%
- **Arrow Down** - Scade volumul cu 5%

## Browser Support

Site-ul funcționează pe toate browserele moderne:
- Chrome/Edge (ultimele versiuni)
- Firefox (ultimele versiuni)
- Safari (ultimele versiuni)
- Opera (ultimele versiuni)

## Troubleshooting

### Stream-ul nu pornește

1. Verifică că URL-ul stream-ului este corect în `script.js`
2. Verifică că stream-ul AzuraCast este activ și accesibil
3. Verifică consola browser-ului pentru erori (F12)
4. Verifică că nu există probleme CORS (Cross-Origin Resource Sharing)

### Probleme de performanță

1. Asigură-te că folosești HTTPS pentru stream-ul audio (recomandat)
2. Verifică că serverul web este configurat corect pentru cache
3. Optimizează dimensiunea fișierelor CSS și JS dacă este necesar

## Securitate

- Folosește HTTPS pentru site (Let's Encrypt)
- Configurează firewall-ul pentru a permite doar porturile necesare (80, 443)
- Actualizează regulat sistemul și serverul web

## Licență

© 2024 Ecou FM. Toate drepturile rezervate.

## Suport

Pentru întrebări sau probleme, contactează echipa Ecou FM.


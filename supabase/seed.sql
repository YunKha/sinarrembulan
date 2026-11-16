-- OPSIONAL: konten awal website (port dari DatabaseSeeder Laravel).
-- Jalankan setelah schema.sql jika ingin website langsung terisi. Lewati jika ingin benar-benar kosong.

insert into hero_sections (headline, subheadline) values
('Innovative IT Solutions For Smarter Future',
 'PT. Sinar Rembulan Inotech menyediakan layanan software development, AI solutions, IT infrastructure, dan digital transformation untuk bisnis modern.');

insert into abouts (title, description, vision, mission, history, year_founded) values
('PT. Sinar Rembulan Inotech',
 'PT. Sinar Rembulan Inotech adalah perusahaan teknologi informasi yang berfokus pada pengembangan solusi digital inovatif. Dengan tim profesional dan berpengalaman, kami telah membantu ratusan perusahaan dalam transformasi digital mereka.',
 'Menjadi perusahaan teknologi terdepan di Indonesia yang memberikan solusi inovatif dan berkelanjutan untuk kemajuan bisnis dan masyarakat.',
 E'1. Mengembangkan solusi teknologi yang inovatif dan berkualitas tinggi\n2. Memberikan layanan terbaik dengan standar internasional\n3. Membangun tim profesional yang kompeten dan berdedikasi\n4. Berkontribusi pada transformasi digital Indonesia',
 'Didirikan pada tahun 2018, PT. Sinar Rembulan Inotech telah berkembang dari startup kecil menjadi perusahaan IT terkemuka.',
 2018);

insert into services (title, slug, icon, short_description, "order", is_featured, description)
select t, s, i, d, o, true, 'Layanan profesional ' || t || ' dari PT. Sinar Rembulan Inotech.'
from (values
 ('Software Development','software-development','code','Pengembangan software custom sesuai kebutuhan bisnis Anda dengan teknologi terkini.',1),
 ('Mobile App Development','mobile-app-development','smartphone','Pembuatan aplikasi mobile Android & iOS yang responsif dan user-friendly.',2),
 ('AI & Smart System','ai-smart-system','cpu','Implementasi kecerdasan buatan dan sistem cerdas untuk otomatisasi bisnis.',3),
 ('IT Infrastructure','it-infrastructure','server','Perancangan dan implementasi infrastruktur IT yang handal dan scalable.',4),
 ('Cloud & Hosting','cloud-hosting','cloud','Layanan cloud computing dan hosting dengan performa tinggi dan keamanan terjamin.',5),
 ('Cyber Security','cyber-security','shield','Perlindungan sistem dan data dari ancaman siber dengan solusi keamanan terbaik.',6),
 ('IT Consulting','it-consulting','users','Konsultasi IT strategis untuk membantu transformasi digital perusahaan Anda.',7),
 ('Maintenance & Support','maintenance-support','tool','Layanan maintenance dan support 24/7 untuk menjaga sistem Anda tetap optimal.',8)
) v(t, s, i, d, o);

insert into portfolio_categories (name, slug, "order") values
('Web Development','web-development',0), ('Mobile Development','mobile-development',1),
('AI System','ai-system',2), ('Dashboard Analytics','dashboard-analytics',3),
('Networking','networking',4), ('Smart Government','smart-government',5);

insert into portfolios (title, slug, category_id, technologies, client_name, short_description, description,
                        features, is_featured, start_date, end_date)
select t, lower(regexp_replace(regexp_replace(t, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')),
       (select id from portfolio_categories where slug = c), tech::jsonb, cl,
       'Project ' || t || ' untuk ' || cl,
       'Proyek pengembangan ' || t || ' yang dikerjakan oleh tim PT. Sinar Rembulan Inotech.',
       '["Dashboard Admin","Real-time Monitoring","Report Generation","API Integration"]'::jsonb,
       true, current_date - interval '8 months', current_date - interval '1 month'
from (values
 ('E-Commerce Platform Modernization','web-development','["Laravel","Vue.js","PostgreSQL","Redis"]','PT. Maju Bersama'),
 ('Mobile Banking Application','mobile-development','["React Native","Node.js","MongoDB"]','Bank Nusantara Digital'),
 ('AI-Powered Customer Service Bot','ai-system','["Python","TensorFlow","FastAPI"]','Telco Indonesia'),
 ('Real-Time Analytics Dashboard','dashboard-analytics','["React","D3.js","Apache Kafka","ClickHouse"]','PT. Data Nusantara'),
 ('Enterprise Network Infrastructure','networking','["Cisco","Fortinet","VMware"]','PT. Infrastruktur Prima'),
 ('Smart City Management System','smart-government','["Laravel","React","IoT","GIS"]','Pemerintah Kota Bandung')
) v(t, c, tech, cl);

insert into clients (name, is_partner, "order")
select n, o <= 4, o - 1 from unnest(array['PT. Telkom Indonesia','Bank Mandiri','Pertamina','PLN',
  'Garuda Indonesia','Tokopedia','Gojek','Bukalapak']) with ordinality as x(n, o);

insert into testimonials (name, position, company, review, rating) values
('Budi Santoso','CEO','PT. Maju Bersama','PT. Sinar Rembulan Inotech memberikan solusi yang sangat profesional. Tim mereka sangat responsif dan hasil kerjanya luar biasa.',5),
('Siti Rahayu','CTO','Bank Nusantara Digital','Kami sangat puas dengan aplikasi mobile banking yang dikembangkan. Performa dan keamanannya sangat baik.',5),
('Ahmad Wijaya','IT Director','Telco Indonesia','AI chatbot yang dikembangkan berhasil meningkatkan efisiensi customer service kami hingga 60%.',5);

insert into blog_categories (name, slug) values
('Technology','technology'), ('Tutorial','tutorial'), ('Company News','company-news'), ('Industry Insights','industry-insights');

insert into blogs (title, slug, category_id, excerpt, content, is_published, is_featured, published_at, tags)
select t, s, (select id from blog_categories where slug = c), e,
       '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>',
       true, true, now() - (d || ' days')::interval, '["technology","innovation"]'::jsonb
from (values
 ('Tren Teknologi 2025 yang Wajib Diketahui','tren-teknologi-2025-yang-wajib-diketahui','technology','Mengenal tren teknologi terbaru yang akan mengubah dunia bisnis.',5),
 ('Panduan Memilih Framework JavaScript Terbaik','panduan-memilih-framework-javascript-terbaik','tutorial','Perbandingan lengkap antara React, Vue, dan Angular.',12),
 ('SRI Raih Penghargaan Best IT Company 2024','sri-raih-penghargaan-best-it-company-2024','company-news','PT. Sinar Rembulan Inotech meraih penghargaan bergengsi.',20)
) v(t, s, c, e, d);

insert into teams (name, position, bio, "order") values
('Dr. Rizky Pratama','CEO & Founder','Visioner teknologi dengan 15+ tahun pengalaman.',1),
('Dewi Anggraini','CTO','Expert di bidang AI dan software architecture.',2),
('Andi Saputra','Lead Developer','Full-stack developer berpengalaman.',3),
('Maya Sari','UI/UX Designer','Spesialis desain user experience.',4);

insert into careers (title, slug, department, location, type, experience_level, description, requirements) values
('Senior Full-Stack Developer','senior-full-stack-developer','Engineering','Jakarta','full-time','senior',
 'Bergabunglah dengan tim engineering kami.',
 E'- 5+ tahun pengalaman\n- Menguasai Laravel & React/Vue\n- Pengalaman dengan cloud services');

insert into social_links (platform, url, icon, "order") values
('Facebook','https://facebook.com/sinarrembulan','facebook',0),
('Instagram','https://instagram.com/sinarrembulan','instagram',1),
('LinkedIn','https://linkedin.com/company/sinarrembulan','linkedin',2),
('Twitter','https://twitter.com/sinarrembulan','twitter',3);

insert into website_settings (key, value) values
('company_name','PT. Sinar Rembulan Inotech'),
('company_email','info@sinarrembulan.com'),
('company_phone','+62 21 1234 5678'),
('company_whatsapp','+6281234567890'),
('company_address','Jl. Teknologi No. 88, Jakarta Selatan, DKI Jakarta 12345'),
('google_maps_embed','https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613507864!3d-6.194741395493371'),
('total_projects','150'), ('happy_clients','85'), ('years_experience','7'), ('team_members','50');

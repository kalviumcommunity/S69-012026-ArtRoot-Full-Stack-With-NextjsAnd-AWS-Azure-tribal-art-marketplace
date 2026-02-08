import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { query } from './lib/db';

async function checkData() {
    try {
        console.log("--- Users ---");
        const users = await query('SELECT id, email, name, role FROM users WHERE email LIKE $1', ['%venkateswarakonetisetty%']);
        console.table(users.rows);

        if (users.rows.length > 0) {
            const userId = users.rows[0].id;
            console.log("\n--- Artist Profile for User " + userId + " ---");
            const artists = await query('SELECT * FROM artists WHERE user_id = $1', [userId]);
            console.table(artists.rows);

            if (artists.rows.length > 0) {
                const artistId = artists.rows[0].id;
                console.log("\n--- Artist Profile via getArtistById Query logic ---");
                // Copy-paste the query from service
                const detailed = await query(`
                    SELECT 
                        a.id, a.user_id, a.tribe, a.location, a.biography, 
                        a.profile_image_url, 
                        u.name, u.email,
                        (SELECT COUNT(*) FROM artworks WHERE artist_id = a.id) as artwork_count_simple
                    FROM artists a
                    JOIN users u ON a.user_id = u.id
                    WHERE a.id = $1
                `, [artistId]);
                console.table(detailed.rows);

                console.log("\n--- Artworks for this Artist ---");
                const artworks = await query('SELECT id, title, artist_id FROM artworks WHERE artist_id = $1', [artistId]);
                console.table(artworks.rows);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

checkData();

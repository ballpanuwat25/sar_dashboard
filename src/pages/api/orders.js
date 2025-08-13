import connection from '@/lib/db';

//get package only
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
      res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
      res.status(204).end();
      return;
    }
  
    try {
        const nowDate = new Date();
        const localTime = new Date(nowDate.getTime() + 7 * 60 * 60 * 1000);
        const formatDate =
          localTime.getUTCFullYear() +
          '-' +
          String(localTime.getUTCMonth() + 1).padStart(2, '0') +
          '-' +
          String(localTime.getUTCDate()).padStart(2, '0') +
          ' ' +
          String(localTime.getUTCHours()).padStart(2, '0') +
          ':' +
          String(localTime.getUTCMinutes()).padStart(2, '0') +
          ':' +
          String(localTime.getUTCSeconds()).padStart(2, '0');

        if (req.method === 'GET') {
            const { id } = req.query;
    
            let whereStr = '';
            let params = [];
            if (id) {
                whereStr = 'WHERE Id = ?';
                params = [id];
            }

            const [packages] = await connection.execute('SELECT * FROM Orders');

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
            return res.status(200).json(packages);
        }
        
        if (req.method === 'POST') {
            // รับข้อมูล user จาก body
            const {userId, packageId, accountId, screenId, totalPrice } = req.body;
            if (!userId || !packageId || !accountId || !screenId || !totalPrice) {
              return res.status(400).json({ error: "Missing required fields" });
            }
      
            const [result] = await connection.execute(
              'INSERT INTO Orders (UserId, PackageId, AccountId, ScreenId, TotalPrice, CreatedDate, ModifiedDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [userId, packageId, accountId, screenId, totalPrice, formatDate, formatDate]
            );
      
            return res.status(201).json({ message: "User created", insertId: result.insertId });
        }
        
        res.setHeader('Allow', ['GET, POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: error.message });
    }
}
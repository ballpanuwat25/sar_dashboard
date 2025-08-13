import connection from '@/lib/db';

//get package only
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
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
      if (req.method === 'GET') {
            const { id } = req.query;
    
            let whereStr = '';
            let params = [];
            if (id) {
              whereStr = 'WHERE Id = ?';
              params = [id];
            }

            let packages;
            if(id) {
              [packages] = await connection.execute('SELECT * FROM Packages WHERE Id = ?', [id]);
            } else {
              [packages] = await connection.execute('SELECT * FROM Packages');
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
            return res.status(200).json(packages);
        } else {
            res.setHeader('Allow', ['GET']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: error.message });
    }
}